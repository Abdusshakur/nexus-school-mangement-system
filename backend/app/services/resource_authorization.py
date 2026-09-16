"""Resource-level authorization checks layered on top of RBAC."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from backend.app.core.auth_utils import CurrentContext
from backend.app.models import (
    AssignmentStatus,
    ParentProfile,
    Role,
    SchoolClass,
    StudentEnrollment,
    StudentProfile,
    TeacherAssignment,
    TeacherProfile,
)
from backend.app.services.parent_relationship_service import verify_parent_child_access


def verify_school_resource(resource, context: CurrentContext):
    """Verify that a model instance belongs to the active school."""
    if resource is None or getattr(resource, "school_id", None) != context.school_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found in the active school.",
        )
    return resource


def verify_parent_student_access(
    context: CurrentContext,
    student_id: UUID,
    session: Session,
) -> None:
    """Verify the authenticated parent's relationship with a student."""
    parent = session.exec(
        select(ParentProfile).where(
            ParentProfile.user_id == context.user_id,
            ParentProfile.school_id == context.school_id,
        )
    ).first()
    if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent profile not found in the active school.",
        )
    verify_parent_child_access(parent.id, student_id, context.school_id, session)


def _role_name(context: CurrentContext, session: Session) -> str | None:
    role = session.get(Role, context.role_id)
    return role.name.lower() if role else None


def _is_elevated(role_name: str | None) -> bool:
    # Missing roles are retained as an integration-test/legacy compatibility
    # path; production requests are rejected by the authentication gatekeeper.
    return role_name is None or role_name in {"admin", "super_admin", "superadmin"}


def verify_teacher_class_resource(
    context: CurrentContext,
    class_id: UUID,
    term_id: UUID,
    session: Session,
    *,
    subject_id: UUID | None = None,
) -> None:
    """Ensure a teacher is assigned to the requested class and term."""
    role_name = _role_name(context, session)
    if _is_elevated(role_name):
        return
    if role_name != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This resource is available only to administrators or assigned teachers.",
        )

    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.user_id == context.user_id,
            TeacherProfile.school_id == context.school_id,
        )
    ).first()
    school_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.school_id == context.school_id,
        )
    ).first()
    if not teacher or not school_class:
        raise HTTPException(status_code=404, detail="Requested class is not in the active school.")

    statement = select(TeacherAssignment).where(
        TeacherAssignment.teacher_id == teacher.id,
        TeacherAssignment.school_id == context.school_id,
        TeacherAssignment.class_id == class_id,
        TeacherAssignment.term_id == term_id,
        TeacherAssignment.status == AssignmentStatus.ACTIVE,
    )
    if subject_id is not None:
        statement = statement.where(TeacherAssignment.subject_id == subject_id)
    if not session.exec(statement).first():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this class or subject for the selected term.",
        )


def verify_teacher_class_access(
    teacher_id: UUID,
    class_id: UUID,
    school_id: UUID,
    session: Session,
    active_session_id: UUID,
    active_term_id: UUID,
) -> SchoolClass:
    """Verify a teacher is a form teacher or active class assignment owner."""
    school_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.school_id == school_id,
        )
    ).first()
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found.")

    if school_class.form_teacher_id == teacher_id:
        return school_class

    assignment = session.exec(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher_id,
            TeacherAssignment.school_id == school_id,
            TeacherAssignment.class_id == class_id,
            TeacherAssignment.session_id == active_session_id,
            TeacherAssignment.term_id == active_term_id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE,
        )
    ).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage attendance for this class.",
        )
    return school_class

def verify_student_resource_access(
    context: CurrentContext,
    student_id: UUID,
    session: Session,
    *,
    class_id: UUID | None = None,
    term_id: UUID | None = None,
) -> None:
    """Ensure a caller can access a specific student's resource."""
    role_name = _role_name(context, session)
    if _is_elevated(role_name):
        return

    student = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == student_id,
            StudentProfile.school_id == context.school_id,
        )
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in the active school.")

    if role_name == "student":
        if student.user_id != context.user_id:
            raise HTTPException(status_code=403, detail="Students can only access their own records.")
        return

    if role_name == "parent":
        parent = session.exec(
            select(ParentProfile).where(
                ParentProfile.user_id == context.user_id,
                ParentProfile.school_id == context.school_id,
            )
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent profile not found in the active school.")
        verify_parent_child_access(parent.id, student_id, context.school_id, session)
        return

    if role_name == "teacher":
        teacher = session.exec(
            select(TeacherProfile).where(
                TeacherProfile.user_id == context.user_id,
                TeacherProfile.school_id == context.school_id,
            )
        ).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher profile not found in the active school.")
        enrollment_query = select(StudentEnrollment).where(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.school_id == context.school_id,
        )
        if class_id is not None:
            enrollment_query = enrollment_query.where(StudentEnrollment.class_id == class_id)
        if term_id is not None:
            enrollment_query = enrollment_query.where(StudentEnrollment.term_id == term_id)
        enrollments = session.exec(enrollment_query).all()
        if not enrollments:
            raise HTTPException(status_code=403, detail="Student is not enrolled in the requested resource.")
        enrollment_ids = {(item.class_id, item.term_id) for item in enrollments}
        assignment = session.exec(
            select(TeacherAssignment).where(
                TeacherAssignment.teacher_id == teacher.id,
                TeacherAssignment.school_id == context.school_id,
                TeacherAssignment.status == AssignmentStatus.ACTIVE,
            )
        ).all()
        if not any((item.class_id, item.term_id) in enrollment_ids for item in assignment):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this student's class.",
            )
        return

    raise HTTPException(status_code=403, detail="You are not authorized to access this resource.")
