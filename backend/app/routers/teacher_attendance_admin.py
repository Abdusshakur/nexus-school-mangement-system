"""Administrative monitoring for teacher QR attendance."""

from datetime import date, datetime, timezone, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.db.database import get_session
from backend.app.models import (
    AttendanceQRSession,
    AttendanceMethod,
    QRType,
    StaffAttendanceStatus,
    StaffAttendanceEventType,
    TeacherAttendanceEvent,
    TeacherDailyAttendance,
    TeacherProfile,
    User,
    TeacherAttendanceSettings,
)
from backend.app.schemas.attendance import (
    QRGenerateRequest,
    QRGenerateResponse,
    TeacherAttendanceAdminItem,
    TeacherAttendanceConfigurationCreate,
    TeacherAttendanceConfigurationResponse,
    TeacherAttendanceConfigurationUpdate,
    TeacherAttendanceCorrectionRequest,
    TeacherAttendanceQRCurrentResponse,
    MissedAttendanceResponse,
)
from backend.app.core.qr_utils import generate_secure_qr_token
from backend.app.services.teacher_attendance_service import (
    attendance_duration_minutes,
    get_attendance_settings,
)
from backend.app.services.timezone_service import get_school_now, get_school_today


router = APIRouter(tags=["Teacher Attendance - Administration"])


def _admin_item(record: TeacherDailyAttendance, teacher: TeacherProfile, user: User):
    return TeacherAttendanceAdminItem(
        teacher_id=teacher.id,
        teacher_name=f"{teacher.first_name} {teacher.last_name}".strip(),
        teacher_email=user.email,
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


@router.get(
    "/teacher-attendance",
    response_model=List[TeacherAttendanceAdminItem],
    summary="List teacher attendance",
    description="Return teacher attendance records for the current school, optionally filtered by date, teacher, or status.",
)
def list_teacher_attendance(
    attendance_date: Optional[date] = Query(None, alias="date", description="Filter by attendance date."),
    teacher_id: Optional[UUID] = Query(None, description="Filter by teacher profile ID."),
    attendance_status: Optional[StaffAttendanceStatus] = Query(None, alias="status"),
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session),
):
    statement = (
        select(TeacherDailyAttendance, TeacherProfile, User)
        .join(TeacherProfile, TeacherDailyAttendance.teacher_id == TeacherProfile.id)
        .join(User, TeacherProfile.user_id == User.id)
        .where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherProfile.school_id == context.school_id,
            User.school_id == context.school_id,
        )
    )
    if attendance_date:
        statement = statement.where(TeacherDailyAttendance.attendance_date == attendance_date)
    if teacher_id:
        statement = statement.where(TeacherDailyAttendance.teacher_id == teacher_id)
    if attendance_status:
        statement = statement.where(TeacherDailyAttendance.status == attendance_status)

    rows = session.exec(
        statement.order_by(
            TeacherDailyAttendance.attendance_date.desc(),
            TeacherProfile.last_name,
            TeacherProfile.first_name,
        )
    ).all()
    return [_admin_item(record, teacher, user) for record, teacher, user in rows]


@router.get(
    "/teacher-attendance/qr/current",
    response_model=TeacherAttendanceQRCurrentResponse,
    summary="Get current teacher attendance QR",
    description="Return metadata for the active school QR. The raw token is not returned because it is never stored; generate a new QR if the frontend no longer has the token.",
)
def get_current_qr(
    qr_type: Optional[QRType] = Query(None, description="Optional QR type: CHECK_IN or CHECK_OUT."),
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    statement = select(AttendanceQRSession).where(
        AttendanceQRSession.school_id == context.school_id,
        AttendanceQRSession.attendance_date == get_school_today(context.school_id, session),
        AttendanceQRSession.is_active.is_(True),
    )
    if qr_type:
        statement = statement.where(AttendanceQRSession.qr_type == qr_type)
    qr_session = session.exec(
        statement.order_by(AttendanceQRSession.created_at.desc())
    ).first()
    if not qr_session:
        raise HTTPException(status_code=404, detail="No active teacher attendance QR found for today.")
    return qr_session


@router.post(
    "/teacher-attendance/{attendance_id}/correction",
    response_model=TeacherAttendanceAdminItem,
    summary="Correct teacher attendance",
    description="Apply an administrator correction to a check-in or check-out and append an attributed audit event.",
)
def correct_teacher_attendance(
    attendance_id: UUID,
    payload: TeacherAttendanceCorrectionRequest,
    context: CurrentContext = Depends(require_permission("attendance:approve")),
    session: Session = Depends(get_session),
):
    record = session.exec(select(TeacherDailyAttendance).where(
        TeacherDailyAttendance.id == attendance_id,
        TeacherDailyAttendance.school_id == context.school_id,
    )).first()
    if not record:
        raise HTTPException(status_code=404, detail="Teacher attendance record not found.")
    if payload.timestamp.date() != record.attendance_date:
        raise HTTPException(status_code=400, detail="Correction timestamp must match the attendance date.")
    timestamp = payload.timestamp
    if timestamp.tzinfo is None:
        timestamp = timestamp.replace(tzinfo=timezone.utc)

    if payload.action == "CHECK_IN":
        record.check_in_at = timestamp
        record.check_in_method = AttendanceMethod.MANUAL
        if not record.check_out_at:
            record.status = StaffAttendanceStatus.CHECKED_IN
        event_type = StaffAttendanceEventType.MANUAL_CHECK_IN
    else:
        if not record.check_in_at:
            raise HTTPException(status_code=400, detail="A teacher must have a check-in before a checkout correction.")
        check_in_at = record.check_in_at
        if check_in_at.tzinfo is None:
            check_in_at = check_in_at.replace(tzinfo=timezone.utc)
        if timestamp < check_in_at:
            raise HTTPException(status_code=400, detail="Checkout cannot be earlier than check-in.")
        record.check_out_at = timestamp
        record.check_out_method = AttendanceMethod.MANUAL
        record.status = StaffAttendanceStatus.CHECKED_OUT
        event_type = StaffAttendanceEventType.MANUAL_CHECK_OUT

    record.updated_at = datetime.now(timezone.utc)
    session.add(record)
    session.add(TeacherAttendanceEvent(
        daily_attendance_id=record.id,
        school_id=context.school_id,
        teacher_id=record.teacher_id,
        event_type=event_type,
        event_time=timestamp,
        method=AttendanceMethod.MANUAL,
        performed_by_id=context.user_id,
        metadata_notes=payload.reason.strip(),
    ))
    teacher_user = session.exec(select(TeacherProfile, User).join(
        User, TeacherProfile.user_id == User.id
    ).where(
        TeacherProfile.id == record.teacher_id,
        TeacherProfile.school_id == context.school_id,
        User.school_id == context.school_id,
    )).first()
    if not teacher_user:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    session.commit()
    return _admin_item(record, teacher_user[0], teacher_user[1])


@router.post(
    "/teacher-attendance/missed/process",
    response_model=MissedAttendanceResponse,
    summary="Process missed teacher attendance",
    description="Mark active teachers without a check-in, or with a check-in but no checkout, as missed for a completed attendance date.",
)
def process_missed_attendance(
    attendance_date: Optional[date] = Query(None, alias="date", description="Date to process; defaults to today."),
    context: CurrentContext = Depends(require_permission("attendance:approve")),
    session: Session = Depends(get_session),
):
    school_today = get_school_today(context.school_id, session)
    target_date = attendance_date or school_today
    settings = get_attendance_settings(context.school_id, session)
    if not settings:
        raise HTTPException(status_code=503, detail="Teacher attendance configuration is not available for this school.")
    if target_date == school_today and get_school_now(context.school_id, session).time().replace(tzinfo=None) <= settings.check_out_end:
        raise HTTPException(status_code=400, detail="Today's attendance cannot be processed before the checkout window closes.")

    teachers = session.exec(select(TeacherProfile, User).join(
        User, TeacherProfile.user_id == User.id
    ).where(
        TeacherProfile.school_id == context.school_id,
        User.school_id == context.school_id,
        User.is_active.is_(True),
    )).all()
    existing = {
        record.teacher_id: record
        for record in session.exec(select(TeacherDailyAttendance).where(
            TeacherDailyAttendance.school_id == context.school_id,
            TeacherDailyAttendance.attendance_date == target_date,
        )).all()
    }
    missed_check_ins = 0
    missed_check_outs = 0
    for teacher, _ in teachers:
        record = existing.get(teacher.id)
        if not record:
            record = TeacherDailyAttendance(
                school_id=context.school_id,
                teacher_id=teacher.id,
                attendance_date=target_date,
                status=StaffAttendanceStatus.MISSED_CHECK_IN,
            )
            session.add(record)
            session.flush()
            missed_check_ins += 1
            event_note = "Automatically marked missed check-in."
        elif record.status in {StaffAttendanceStatus.NOT_STARTED, StaffAttendanceStatus.MISSED_CHECK_IN}:
            record.status = StaffAttendanceStatus.MISSED_CHECK_IN
            record.updated_at = datetime.now(timezone.utc)
            session.add(record)
            missed_check_ins += 1
            event_note = "Automatically marked missed check-in."
        elif record.check_in_at and not record.check_out_at:
            record.status = StaffAttendanceStatus.MISSED_CHECK_OUT
            record.updated_at = datetime.now(timezone.utc)
            session.add(record)
            missed_check_outs += 1
            event_note = "Automatically marked missed check-out."
        else:
            continue
        session.add(TeacherAttendanceEvent(
            daily_attendance_id=record.id,
            school_id=context.school_id,
            teacher_id=teacher.id,
            event_type=StaffAttendanceEventType.CORRECTION,
            event_time=datetime.now(timezone.utc),
            method=AttendanceMethod.SYSTEM,
            performed_by_id=context.user_id,
            metadata_notes=event_note,
        ))
    session.commit()
    return MissedAttendanceResponse(
        attendance_date=target_date,
        missed_check_ins=missed_check_ins,
        missed_check_outs=missed_check_outs,
    )


@router.get(
    "/teacher-attendance/{teacher_id}",
    response_model=List[TeacherAttendanceAdminItem],
    summary="Get teacher attendance history",
    description="Return attendance history for one teacher in the current school, optionally filtered by date range or status.",
)
def get_teacher_attendance(
    teacher_id: UUID,
    start_date: Optional[date] = Query(None, description="Inclusive start date."),
    end_date: Optional[date] = Query(None, description="Inclusive end date."),
    attendance_status: Optional[StaffAttendanceStatus] = Query(None, alias="status"),
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session),
):
    if start_date and end_date and start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date cannot be after end_date.")
    teacher_user = session.exec(
        select(TeacherProfile, User)
        .join(User, TeacherProfile.user_id == User.id)
        .where(
            TeacherProfile.id == teacher_id,
            TeacherProfile.school_id == context.school_id,
            User.school_id == context.school_id,
        )
    ).first()
    if not teacher_user:
        raise HTTPException(status_code=404, detail="Teacher not found.")
    teacher, user = teacher_user

    statement = select(TeacherDailyAttendance).where(
        TeacherDailyAttendance.school_id == context.school_id,
        TeacherDailyAttendance.teacher_id == teacher_id,
    )
    if start_date:
        statement = statement.where(TeacherDailyAttendance.attendance_date >= start_date)
    if end_date:
        statement = statement.where(TeacherDailyAttendance.attendance_date <= end_date)
    if attendance_status:
        statement = statement.where(TeacherDailyAttendance.status == attendance_status)
    records = session.exec(
        statement.order_by(TeacherDailyAttendance.attendance_date.desc())
    ).all()
    return [_admin_item(record, teacher, user) for record in records]


@router.get(
    "/teacher-attendance/configuration",
    response_model=TeacherAttendanceConfigurationResponse,
    summary="Get teacher attendance configuration",
    description="Return the current school's teacher check-in, check-out, late, and QR rotation settings.",
)
@router.get("/attendance/configuration", include_in_schema=False)
def get_configuration(
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session),
):
    settings = get_attendance_settings(context.school_id, session)
    if not settings:
        raise HTTPException(status_code=404, detail="Teacher attendance configuration not found.")
    return settings


@router.post(
    "/teacher-attendance/configuration",
    response_model=TeacherAttendanceConfigurationResponse,
    status_code=201,
    summary="Create teacher attendance configuration",
    description="Create the school's teacher attendance windows and QR rotation policy.",
)
@router.post("/attendance/configuration", include_in_schema=False)
def create_configuration(
    payload: TeacherAttendanceConfigurationCreate,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    if get_attendance_settings(context.school_id, session):
        raise HTTPException(status_code=409, detail="Teacher attendance configuration already exists.")
    settings = TeacherAttendanceSettings(school_id=context.school_id, **payload.model_dump())
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


@router.patch(
    "/teacher-attendance/configuration",
    response_model=TeacherAttendanceConfigurationResponse,
    summary="Update teacher attendance configuration",
    description="Update the school's teacher attendance windows and QR rotation policy.",
)
@router.patch("/attendance/configuration", include_in_schema=False)
def update_configuration(
    payload: TeacherAttendanceConfigurationUpdate,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    settings = get_attendance_settings(context.school_id, session)
    if not settings:
        raise HTTPException(status_code=404, detail="Teacher attendance configuration not found.")
    values = {
        **{field: getattr(settings, field) for field in TeacherAttendanceConfigurationCreate.model_fields},
        **payload.model_dump(exclude_unset=True),
    }
    validated = TeacherAttendanceConfigurationCreate.model_validate(values)
    for field, value in validated.model_dump().items():
        setattr(settings, field, value)
    settings.updated_at = datetime.now(timezone.utc)
    session.add(settings)
    session.commit()
    session.refresh(settings)
    return settings


@router.post(
    "/teacher-attendance/qr/generate",
    response_model=QRGenerateResponse,
    summary="Generate teacher attendance QR",
    description="Generate a short-lived school QR for teacher check-in or check-out. The raw token is returned only once.",
)
@router.post("/attendance/qr/generate", include_in_schema=False)
def generate_attendance_qr(
    payload: QRGenerateRequest,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    today = get_school_today(context.school_id, session)
    now = datetime.now(timezone.utc)
    settings = get_attendance_settings(context.school_id, session)
    if not settings:
        raise HTTPException(
            status_code=503,
            detail="Teacher attendance configuration is not available for this school.",
        )
    active_sessions = session.exec(select(AttendanceQRSession).where(
        AttendanceQRSession.school_id == context.school_id,
        AttendanceQRSession.attendance_date == today,
        AttendanceQRSession.qr_type == payload.qr_type,
        AttendanceQRSession.is_active.is_(True),
    )).all()
    for active_qr in active_sessions:
        active_qr.is_active = False
        session.add(active_qr)

    raw_token, token_hash = generate_secure_qr_token()
    qr_session = AttendanceQRSession(
        school_id=context.school_id,
        attendance_date=today,
        qr_type=payload.qr_type,
        token_hash=token_hash,
        valid_from=now,
        expires_at=now + timedelta(seconds=settings.qr_rotation_seconds),
        is_active=True,
    )
    session.add(qr_session)
    session.commit()
    return QRGenerateResponse(
        raw_token=raw_token,
        expires_at=qr_session.expires_at,
        qr_type=qr_session.qr_type,
    )
