from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.db.database import get_session
from backend.app.models import (
    AcademicSession,
    AcademicTerm,
    AssignmentStatus,
    EnrollmentStatus,
    SchoolClass,
    StudentEnrollment,
    StudentProfile,
    Subject,
    TeacherAssignment,
    TeacherProfile,
    User,
)
from backend.app.schemas.teacher import (
    TeacherAssignmentContextResponse,
    TeacherContextResponse,
    TeacherStudentContextResponse,
)

router = APIRouter(prefix="/teachers", tags=["Teacher Context"])


def get_current_teacher_profile(
    context: CurrentContext, session: Session
) -> Tuple[TeacherProfile, User]:
    result = session.exec(
        select(TeacherProfile, User)
        .join(User, TeacherProfile.user_id == User.id)
        .where(
            TeacherProfile.user_id == context.user_id,
            TeacherProfile.school_id == context.school_id,
            User.school_id == context.school_id,
        )
    ).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Teacher profile not found for this user account.",
        )
    return result


def get_active_term_and_session(
    school_id: UUID, session: Session
) -> Tuple[AcademicSession, AcademicTerm]:
    active_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.school_id == school_id,
            AcademicSession.is_current.is_(True),
        )
    ).first()
    if not active_session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current academic session is not configured for this school.",
        )

    active_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.school_id == school_id,
            AcademicTerm.session_id == active_session.id,
            AcademicTerm.is_current.is_(True),
        )
    ).first()
    if not active_term:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Current academic term is not configured for this school.",
        )
    return active_session, active_term


@router.get("/me", response_model=TeacherContextResponse)
def get_my_teacher_profile(
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session),
):
    teacher, user = get_current_teacher_profile(context, session)
    return TeacherContextResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=user.email,
        department=teacher.department,
        phone_number=teacher.phone_number,
        is_active=user.is_active,
    )


@router.get(
    "/me/assignments",
    response_model=List[TeacherAssignmentContextResponse],
)
def get_my_teacher_assignments(
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session),
):
    teacher, _ = get_current_teacher_profile(context, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    query = (
        select(TeacherAssignment, SchoolClass, Subject)
        .join(SchoolClass, TeacherAssignment.class_id == SchoolClass.id)
        .join(Subject, TeacherAssignment.subject_id == Subject.id)
        .where(
            TeacherAssignment.teacher_id == teacher.id,
            TeacherAssignment.school_id == context.school_id,
            TeacherAssignment.session_id == active_session.id,
            TeacherAssignment.term_id == active_term.id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE,
            SchoolClass.school_id == context.school_id,
            Subject.school_id == context.school_id,
        )
    )
    return [
        TeacherAssignmentContextResponse(
            assignment_id=assignment.id,
            class_id=school_class.id,
            class_name=school_class.name,
            subject_id=subject.id,
            subject_name=subject.name,
            status=assignment.status.value,
        )
        for assignment, school_class, subject in session.exec(query).all()
    ]


@router.get(
    "/me/students",
    response_model=List[TeacherStudentContextResponse],
)
def get_my_students(
    class_id: Optional[UUID] = Query(
        default=None, description="Optional filter by an assigned class ID"
    ),
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session),
):
    teacher, _ = get_current_teacher_profile(context, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    assigned_class_ids = session.exec(
        select(TeacherAssignment.class_id)
        .where(
            TeacherAssignment.teacher_id == teacher.id,
            TeacherAssignment.school_id == context.school_id,
            TeacherAssignment.session_id == active_session.id,
            TeacherAssignment.term_id == active_term.id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE,
        )
        .distinct()
    ).all()
    assigned_class_ids = list(assigned_class_ids)
    if not assigned_class_ids:
        return []

    if class_id is not None:
        if class_id not in assigned_class_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to teach this class.",
            )
        target_class_ids = [class_id]
    else:
        target_class_ids = assigned_class_ids

    query = (
        select(StudentEnrollment, StudentProfile, SchoolClass)
        .join(StudentProfile, StudentEnrollment.student_id == StudentProfile.id)
        .join(SchoolClass, StudentEnrollment.class_id == SchoolClass.id)
        .where(
            StudentEnrollment.school_id == context.school_id,
            StudentEnrollment.session_id == active_session.id,
            StudentEnrollment.term_id == active_term.id,
            StudentEnrollment.class_id.in_(target_class_ids),
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            StudentProfile.school_id == context.school_id,
            SchoolClass.school_id == context.school_id,
        )
    )
    return [
        TeacherStudentContextResponse(
            student_id=student.id,
            admission_number=student.admission_number,
            first_name=student.first_name,
            last_name=student.last_name,
            gender=student.gender,
            class_id=school_class.id,
            class_name=school_class.name,
        )
        for _, student, school_class in session.exec(query).all()
    ]
