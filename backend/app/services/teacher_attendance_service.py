"""Business rules shared by teacher attendance endpoints."""

from datetime import datetime, time
from typing import Optional, Literal
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from backend.app.models import School, TeacherAttendanceSettings
from backend.app.services.timezone_service import to_school_time


DEFAULT_TEACHER_ATTENDANCE_SETTINGS = {
    "check_in_start": time(7, 0),
    "expected_check_in_time": time(8, 0),
    "check_in_end": time(9, 0),
    "late_threshold": time(8, 15),
    "check_out_start": time(15, 30),
    "expected_check_out_time": time(16, 0),
    "check_out_end": time(18, 0),
    "qr_rotation_seconds": 300,
}


def get_attendance_settings(school_id: UUID, session: Session) -> Optional[TeacherAttendanceSettings]:
    return session.exec(
        select(TeacherAttendanceSettings).where(
            TeacherAttendanceSettings.school_id == school_id
        )
    ).first()


def ensure_default_attendance_settings(
    school: School, session: Session
) -> TeacherAttendanceSettings:
    """Create the standard configuration when a school has none."""
    settings = get_attendance_settings(school.id, session)
    if settings:
        return settings
    settings = TeacherAttendanceSettings(
        school_id=school.id,
        **DEFAULT_TEACHER_ATTENDANCE_SETTINGS,
    )
    session.add(settings)
    session.flush()
    return settings


def validate_attendance_window(
    school_id: UUID,
    attendance_type: Literal["CHECK_IN", "CHECK_OUT"],
    now: datetime,
    session: Session,
) -> bool:
    """Validate a configured scan window and return whether check-in is late.

    Every school should have settings after the transition migration. A missing
    row is treated as a configuration failure rather than silently bypassing
    attendance policy.
    """
    settings = get_attendance_settings(school_id, session)
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Teacher attendance configuration is not available for this school.",
        )

    school = session.exec(select(School).where(School.id == school_id)).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")
    current_time = to_school_time(now, school.timezone).time().replace(tzinfo=None)
    if attendance_type == "CHECK_IN":
        start, end = settings.check_in_start, settings.check_in_end
        if not start <= current_time <= end:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Check-in is only allowed between {start.strftime('%H:%M')} and {end.strftime('%H:%M')}.",
            )
        return current_time > settings.late_threshold

    start, end = settings.check_out_start, settings.check_out_end
    if not start <= current_time <= end:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Check-out is only allowed between {start.strftime('%H:%M')} and {end.strftime('%H:%M')}.",
        )
    return False


def attendance_duration_minutes(
    check_in_at: Optional[datetime], check_out_at: Optional[datetime]
) -> Optional[int]:
    """Return completed attendance duration in whole minutes."""
    if not check_in_at or not check_out_at:
        return None
    seconds = (check_out_at - check_in_at).total_seconds()
    return max(0, round(seconds / 60))
