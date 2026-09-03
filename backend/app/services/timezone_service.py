"""Timezone helpers for school-local attendance business rules.

Attendance event timestamps remain UTC. This module is only responsible for
converting those instants when a school-local date or clock time is required.
"""

from datetime import date, datetime, timezone as utc_timezone
from typing import Union
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import HTTPException, status
from sqlmodel import Session, select

from backend.app.models import School


DEFAULT_SCHOOL_TIMEZONE = "Africa/Lagos"


def _zone(timezone_name: str) -> ZoneInfo:
    try:
        return ZoneInfo(timezone_name)
    except (ZoneInfoNotFoundError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid school timezone configuration: {timezone_name!r}.",
        )


def get_school_timezone(school_id: UUID, session: Session) -> ZoneInfo:
    school = session.exec(select(School).where(School.id == school_id)).first()
    if not school:
        raise HTTPException(status_code=404, detail="School not found.")
    return _zone(school.timezone or DEFAULT_SCHOOL_TIMEZONE)


def to_school_time(
    utc_datetime: datetime, timezone_name: Union[str, ZoneInfo]
) -> datetime:
    """Convert a UTC instant to a timezone-aware local datetime.

    Naive values are treated as UTC for compatibility with existing columns.
    """
    if utc_datetime.tzinfo is None:
        utc_datetime = utc_datetime.replace(tzinfo=utc_timezone.utc)
    zone = timezone_name if isinstance(timezone_name, ZoneInfo) else _zone(timezone_name)
    return utc_datetime.astimezone(zone)


def get_school_now(school_id: UUID, session: Session) -> datetime:
    return datetime.now(utc_timezone.utc).astimezone(get_school_timezone(school_id, session))


def get_school_today(school_id: UUID, session: Session) -> date:
    return get_school_now(school_id, session).date()
