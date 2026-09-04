from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
import calendar
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
    TeacherAttendanceHistoryItem,
    TeacherAttendanceStatsResponse,
    TeacherAttendanceActionResponse,
    TeacherTodayStatusResponse,
)
from backend.app.services.teacher_attendance_service import (
    attendance_duration_minutes,
    validate_attendance_window,
)
from backend.app.services.timezone_service import get_school_today



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
    if qr_session.attendance_date != get_school_today(context.school_id, session):
        raise HTTPException(status_code=400, detail="This QR code is not valid for today.")

    valid_from = qr_session.valid_from
    if valid_from.tzinfo is None:
        valid_from = valid_from.replace(tzinfo=timezone.utc)
    if valid_from > now:
        raise HTTPException(status_code=400, detail="This QR code is not active yet.")

    if not qr_session.is_active or is_token_expired(qr_session.expires_at):
        raise HTTPException(status_code=400, detail="This QR code has expired. Please scan the current one.")

    return qr_session


@router.get("/me/today", response_model=TeacherTodayStatusResponse, summary="Get my teacher attendance status for today")
def get_my_status_today(
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session)
):
    teacher, _ = get_current_teacher_profile(context, session)
    today = get_school_today(context.school_id, session)

    daily_record = session.exec(
        select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.teacher_id == teacher.id,
            TeacherDailyAttendance.attendance_date == today
        )
    ).first()

    if not daily_record:
        return TeacherTodayStatusResponse(
            date=today,
            status=StaffAttendanceStatus.NOT_STARTED,
        )

    return TeacherTodayStatusResponse(
        date=today,
        status=daily_record.status,
        is_late=daily_record.is_late,
        check_in_at=daily_record.check_in_at,
        check_out_at=daily_record.check_out_at,
        check_in_method=daily_record.check_in_method,
        check_out_method=daily_record.check_out_method,
        duration_minutes=attendance_duration_minutes(
            daily_record.check_in_at, daily_record.check_out_at
        ),
    )


@router.get(
    "/me/history",
    response_model=List[TeacherAttendanceHistoryItem],
    summary="Get my teacher attendance history",
    description="Return the authenticated teacher's attendance records, optionally filtered by an inclusive date range.",
)
def get_my_attendance_history(
    start_date: Optional[date] = Query(None, description="Inclusive start date in YYYY-MM-DD format."),
    end_date: Optional[date] = Query(None, description="Inclusive end date in YYYY-MM-DD format."),
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date.")

    teacher, _ = get_current_teacher_profile(context, session)
    statement = select(TeacherDailyAttendance).where(
        TeacherDailyAttendance.school_id == context.school_id,
        TeacherDailyAttendance.teacher_id == teacher.id,
    )
    if start_date:
        statement = statement.where(TeacherDailyAttendance.attendance_date >= start_date)
    if end_date:
        statement = statement.where(TeacherDailyAttendance.attendance_date <= end_date)

    records = session.exec(
        statement.order_by(TeacherDailyAttendance.attendance_date.desc())
    ).all()
    return [
        TeacherAttendanceHistoryItem(
            attendance_date=record.attendance_date,
            status=record.status,
            is_late=record.is_late,
            check_in_at=record.check_in_at,
            check_out_at=record.check_out_at,
            check_in_method=record.check_in_method,
            check_out_method=record.check_out_method,
            duration_minutes=attendance_duration_minutes(
                record.check_in_at, record.check_out_at
            ),
            academic_session_id=record.academic_session_id,
            term_id=record.term_id,
        )
        for record in records
    ]


@router.get(
    "/me/attendance-stats",
    response_model=TeacherAttendanceStatsResponse,
    summary="Get my monthly attendance statistics",
    description="Return monthly attendance metrics for the authenticated teacher. If year and month are omitted, the current month is used.",
)
def get_my_attendance_stats(
    year: Optional[int] = Query(None, ge=2000, le=2100, description="Calendar year."),
    month: Optional[int] = Query(None, ge=1, le=12, description="Calendar month from 1 to 12."),
    context: CurrentContext = Depends(require_permission("teacher:read")),
    session: Session = Depends(get_session),
):
    today = get_school_today(context.school_id, session)
    selected_year = year if year is not None else today.year
    selected_month = month if month is not None else today.month
    month_start = date(selected_year, selected_month, 1)
    month_end = date(
        selected_year,
        selected_month,
        calendar.monthrange(selected_year, selected_month)[1],
    )
    if selected_year == today.year and selected_month == today.month:
        working_day_end = min(month_end, today)
    else:
        working_day_end = month_end
    total_working_days = sum(
        1
        for day_number in range(1, working_day_end.day + 1)
        if date(selected_year, selected_month, day_number).weekday() < 5
    )

    teacher, _ = get_current_teacher_profile(context, session)
    records = session.exec(
        select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.teacher_id == teacher.id,
            TeacherDailyAttendance.attendance_date >= month_start,
            TeacherDailyAttendance.attendance_date <= month_end,
        )
    ).all()
    present_statuses = {
        StaffAttendanceStatus.CHECKED_IN,
        StaffAttendanceStatus.CHECKED_OUT,
        StaffAttendanceStatus.MISSED_CHECK_OUT,
    }
    present_days = sum(record.status in present_statuses for record in records)
    late_days = sum(record.is_late for record in records if record.status in present_statuses)
    absent_days = sum(record.status == StaffAttendanceStatus.MISSED_CHECK_IN for record in records)
    attendance_rate = round(
        (present_days / total_working_days * 100) if total_working_days else 0.0,
        1,
    )
    return TeacherAttendanceStatsResponse(
        period=month_start.strftime("%B %Y"),
        attendance_rate=attendance_rate,
        present_days=present_days,
        late_days=late_days,
        absent_days=absent_days,
        total_working_days=total_working_days,
    )


@router.post("/check-in", response_model=TeacherAttendanceActionResponse)
def scan_check_in(
    payload: AttendanceScanRequest,
    context: CurrentContext = Depends(require_permission("teacher:write")),
    session: Session = Depends(get_session)
):
    teacher, _ = get_current_teacher_profile(context, session)
    now = datetime.now(timezone.utc)
    today = get_school_today(context.school_id, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    # 1. Validate the Token
    validate_qr_scan(payload.token, QRType.CHECK_IN, context, session)
    is_late = validate_attendance_window(context.school_id, "CHECK_IN", now, session)

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
            academic_session_id=active_session.id,
            term_id=active_term.id,
            attendance_date=today
        )
        session.add(daily_record)
        session.flush() # Need the ID for the event log

    daily_record.check_in_at = now
    daily_record.academic_session_id = daily_record.academic_session_id or active_session.id
    daily_record.term_id = daily_record.term_id or active_term.id
    daily_record.status = StaffAttendanceStatus.CHECKED_IN
    daily_record.is_late = is_late
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
    today = get_school_today(context.school_id, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    # 1. Validate Token
    validate_qr_scan(payload.token, QRType.CHECK_OUT, context, session)
    validate_attendance_window(context.school_id, "CHECK_OUT", now, session)

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
    daily_record.academic_session_id = daily_record.academic_session_id or active_session.id
    daily_record.term_id = daily_record.term_id or active_term.id
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
