from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from datetime import date, datetime, timezone


from backend.app.models import (
    TeacherDailyAttendance, TeacherAttendanceEvent, AttendanceQRSession, 
    QRType, StaffAttendanceStatus, AttendanceMethod, StaffAttendanceEventType
)
from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.db.database import get_session
from backend.app.models import (
    AcademicSession, AcademicTerm, AssignmentStatus, EnrollmentStatus,
    SchoolClass, StudentEnrollment, StudentProfile,  Subject, TeacherAssignment,
    TeacherProfile,  User, TeacherDailyAttendance, TeacherAttendanceEvent, AttendanceQRSession, 
    QRType, StaffAttendanceStatus, AttendanceMethod, StaffAttendanceEventType
)
from backend.app.schemas.teacher import (
    TeacherAssignmentContextResponse, TeacherContextResponse, TeacherStudentContextResponse,
)
from backend.app.core.qr_utils import hash_token, is_token_expired
from backend.app.schemas.attendance import (
    AttendanceScanRequest,
    TeacherAttendanceActionResponse,
    TeacherTodayStatusResponse,
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



def validate_qr_scan(raw_token: str, expected_type: QRType, context: CurrentContext, session: Session):
    """Core logic to hash the token, find it in DB, and verify validity/tenant."""
    token_hash = hash_token(raw_token)
    
    qr_session = session.exec(
        select(AttendanceQRSession).where(AttendanceQRSession.token_hash == token_hash)
    ).first()

    if not qr_session:
        raise HTTPException(status_code=400, detail="Invalid QR Code.")
    
    if qr_session.school_id != context.school_id:
        raise HTTPException(status_code=403, detail="Security Violation: This QR code belongs to a different school.")

    if qr_session.qr_type != expected_type:
        raise HTTPException(status_code=400, detail=f"Wrong QR Code type. Expected {expected_type.value}.")

    now = datetime.now(timezone.utc)
    if qr_session.attendance_date != date.today():
        raise HTTPException(status_code=400, detail="This QR code is not valid for today.")

    valid_from = qr_session.valid_from
    if valid_from.tzinfo is None:
        valid_from = valid_from.replace(tzinfo=timezone.utc)
    if valid_from > now:
        raise HTTPException(status_code=400, detail="This QR code is not active yet.")

    if not qr_session.is_active or is_token_expired(qr_session.expires_at):
        raise HTTPException(status_code=400, detail="This QR code has expired. Please scan the current one.")

    return qr_session


@router.get("/me/today", response_model=TeacherTodayStatusResponse)
def get_my_status_today(
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session)
):
    teacher, _ = get_current_teacher_profile(context, session)
    today = date.today()

    daily_record = session.exec(
        select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.teacher_id == teacher.id,
            TeacherDailyAttendance.attendance_date == today
        )
    ).first()

    if not daily_record:
        return TeacherTodayStatusResponse(date=today, status=StaffAttendanceStatus.NOT_STARTED)

    return TeacherTodayStatusResponse(
        date=today,
        status=daily_record.status,
        check_in_at=daily_record.check_in_at,
        check_out_at=daily_record.check_out_at
    )


@router.post("/check-in", response_model=TeacherAttendanceActionResponse)
def scan_check_in(
    payload: AttendanceScanRequest,
    context: CurrentContext = Depends(require_permission("teacher:write")),
    session: Session = Depends(get_session)
):
    teacher, _ = get_current_teacher_profile(context, session)
    now = datetime.now(timezone.utc)
    today = date.today()

    # 1. Validate the Token
    validate_qr_scan(payload.token, QRType.CHECK_IN, context, session)

    # 2. Prevent Double Check-In
    daily_record = session.exec(
        select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.teacher_id == teacher.id,
            TeacherDailyAttendance.attendance_date == today
        )
    ).first()

    if daily_record and daily_record.check_in_at:
        return {"message": "Already checked in.", "check_in_at": daily_record.check_in_at}

    # 3. Create Record
    if not daily_record:
        daily_record = TeacherDailyAttendance(
            school_id=context.school_id,
            teacher_id=teacher.id,
            attendance_date=today
        )
        session.add(daily_record)
        session.flush() # Need the ID for the event log

    daily_record.check_in_at = now
    daily_record.status = StaffAttendanceStatus.CHECKED_IN
    daily_record.check_in_method = AttendanceMethod.QR

    # 4. Log Immutable Event
    audit_event = TeacherAttendanceEvent(
        daily_attendance_id=daily_record.id,
        school_id=context.school_id,
        teacher_id=teacher.id,
        event_type=StaffAttendanceEventType.CHECK_IN,
        event_time=now,
        method=AttendanceMethod.QR
    )
    session.add(audit_event)
    session.commit()

    return {"message": "Successfully checked in!", "time": now}


@router.post("/check-out", response_model=TeacherAttendanceActionResponse)
def scan_check_out(
    payload: AttendanceScanRequest,
    context: CurrentContext = Depends(require_permission("teacher:write")),
    session: Session = Depends(get_session)
):
    teacher, _ = get_current_teacher_profile(context, session)
    now = datetime.now(timezone.utc)
    today = date.today()

    # 1. Validate Token
    validate_qr_scan(payload.token, QRType.CHECK_OUT, context, session)

    # 2. Verify they actually checked in today
    daily_record = session.exec(
        select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.teacher_id == teacher.id,
            TeacherDailyAttendance.attendance_date == today
        )
    ).first()

    if not daily_record or not daily_record.check_in_at:
        raise HTTPException(status_code=400, detail="You must check in before you can check out.")

    if daily_record.check_out_at:
        return {"message": "Already checked out.", "check_out_at": daily_record.check_out_at}

    # 3. Update Record
    daily_record.check_out_at = now
    daily_record.status = StaffAttendanceStatus.CHECKED_OUT
    daily_record.check_out_method = AttendanceMethod.QR

    # 4. Log Event
    audit_event = TeacherAttendanceEvent(
        daily_attendance_id=daily_record.id,
        school_id=context.school_id,
        teacher_id=teacher.id,
        event_type=StaffAttendanceEventType.CHECK_OUT,
        event_time=now,
        method=AttendanceMethod.QR
    )
    session.add(audit_event)
    session.commit()

    return {"message": "Successfully checked out!", "time": now}
