"""Shared SQL expressions for membership-authoritative access."""

from uuid import UUID

from sqlalchemy import and_
from sqlmodel import select

from backend.app.models import MembershipStatus, UserSchoolLink


def user_active_in_school_clause(school_id: UUID):
    """Return the authoritative active-membership predicate for a school."""
    return and_(
        UserSchoolLink.school_id == school_id,
        UserSchoolLink.is_active.is_(True),
        UserSchoolLink.status == MembershipStatus.ACTIVE,
    )
