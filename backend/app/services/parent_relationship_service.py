from fastapi import HTTPException, status
from sqlmodel import Session, select
from uuid import UUID

from backend.app.core.auth_utils import CurrentContext
from backend.app.models import (
    ParentProfile,
    ParentStudentLink,
    RelationshipType,
    School,
    StudentProfile,
)


def _full_name(first_name: str, last_name: str) -> str:
    return f"{first_name} {last_name}".strip()


def build_parent_student_link(
    school: School,
    parent: ParentProfile,
    student: StudentProfile,
    relationship_type: RelationshipType | str,
    *,
    is_primary_contact: bool = False,
    is_financial_sponsor: bool = False,
) -> ParentStudentLink:
    """Build a tenant-scoped link with readable snapshots for database inspection."""
    return ParentStudentLink(
        school_id=school.id,
        school_name=school.name,
        parent_id=parent.id,
        parent_name=_full_name(parent.first_name, parent.last_name),
        student_id=student.id,
        student_name=_full_name(student.first_name, student.last_name),
        relationship_type=relationship_type,
        is_primary_contact=is_primary_contact,
        is_financial_sponsor=is_financial_sponsor,
    )


def get_current_parent_profile(
    context: CurrentContext,
    session: Session,
) -> ParentProfile:
    """Resolve the authenticated parent's profile in the active school."""
    parent_profile = session.exec(
        select(ParentProfile).where(
            ParentProfile.user_id == context.user_id,
            ParentProfile.school_id == context.school_id,
        )
    ).first()
    if not parent_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parent profile not found in the active school.",
        )
    return parent_profile


def verify_parent_child_access(
    parent_profile_id: UUID,
    student_id: UUID,
    school_id: UUID,
    session: Session,
) -> ParentStudentLink:
    """Verify that a parent can access a student in the active school."""
    link = session.exec(
        select(ParentStudentLink)
        .join(ParentProfile, ParentStudentLink.parent_id == ParentProfile.id)
        .join(StudentProfile, ParentStudentLink.student_id == StudentProfile.id)
        .where(
            ParentStudentLink.parent_id == parent_profile_id,
            ParentStudentLink.student_id == student_id,
            ParentStudentLink.school_id == school_id,
            ParentProfile.school_id == school_id,
            StudentProfile.school_id == school_id,
        )
    ).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this student.",
        )
    return link
