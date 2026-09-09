"""Transactional services for school onboarding and platform review."""

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlmodel import Session, select

from backend.app.core.auth_utils import hash_password
from backend.app.models import (
    AdminProfile,
    ApplicationStatus,
    MembershipStatus,
    PlatformActivityLog,
    Role,
    School,
    SchoolApplication,
    SchoolStatus,
    User,
    UserSchoolLink,
    UserStatus,
)
from backend.app.schemas.school_application import (
    SchoolApplicationRejectRequest,
    SchoolApplicationSignupRequest,
)


def submit_school_application(
    payload: SchoolApplicationSignupRequest,
    session: Session,
) -> SchoolApplication:
    """Create a pending school, owner account, membership, and application atomically."""
    school_email = str(payload.school_email).strip().lower()
    owner_email = str(payload.owner_email).strip().lower()

    if session.exec(select(School).where(School.email == school_email)).first():
        raise HTTPException(status_code=409, detail="A school with this email already exists.")
    if session.exec(select(User).where(User.email == owner_email)).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    admin_role = session.exec(select(Role).where(Role.name == "admin")).first()
    if not admin_role:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The school admin role is not configured.",
        )

    now = datetime.now(timezone.utc)
    school = School(
        name=payload.school_name.strip(),
        email=school_email,
        phone_number=payload.school_phone,
        full_physical_address=payload.full_physical_address,
        city=payload.city,
        state=payload.state,
        country=payload.country.strip(),
        timezone=payload.timezone.strip(),
        is_active=False,
        status=SchoolStatus.PENDING_APPROVAL,
    )
    user = User(
        email=owner_email,
        password_hash=hash_password(payload.owner_password),
        role_id=admin_role.id,
        status=UserStatus.PENDING_ACTIVATION,
        is_active=False,
    )
    session.add_all([school, user])
    session.flush()

    membership = UserSchoolLink(
        user_id=user.id,
        school_id=school.id,
        role_id=admin_role.id,
        is_active=False,
        status=MembershipStatus.PENDING,
        is_owner=True,
    )
    profile = AdminProfile(
        user_id=user.id,
        school_id=school.id,
        first_name=payload.owner_first_name.strip(),
        last_name=payload.owner_last_name.strip(),
        phone_number=payload.owner_phone,
    )
    application = SchoolApplication(
        school_id=school.id,
        applicant_user_id=user.id,
        status=ApplicationStatus.PENDING,
        school_name=school.name,
        applicant_name=f"{profile.first_name} {profile.last_name}".strip(),
        created_at=now,
        updated_at=now,
    )
    session.add_all([membership, profile, application])
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise
    session.refresh(application)
    return application


def _get_application(application_id, session: Session) -> SchoolApplication:
    application = session.get(SchoolApplication, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="School application not found.")
    if application.status != ApplicationStatus.PENDING:
        raise HTTPException(
            status_code=409,
            detail="Only pending school applications can be reviewed.",
        )
    return application


def _reviewer_name(reviewer_id, session: Session) -> str:
    profile = session.exec(
        select(AdminProfile).where(AdminProfile.user_id == reviewer_id)
    ).first()
    if profile:
        return f"{profile.first_name} {profile.last_name}".strip()
    reviewer = session.get(User, reviewer_id)
    return reviewer.email if reviewer else "Platform administrator"


def approve_school_application(application_id, reviewer_id, session: Session) -> SchoolApplication:
    application = _get_application(application_id, session)
    school = session.get(School, application.school_id)
    user = session.get(User, application.applicant_user_id)
    membership = session.exec(
        select(UserSchoolLink).where(
            UserSchoolLink.user_id == application.applicant_user_id,
            UserSchoolLink.school_id == application.school_id,
        )
    ).first()
    if not school or not user or not membership:
        raise HTTPException(status_code=409, detail="Application onboarding records are incomplete.")

    role = session.get(Role, membership.role_id)
    if not role or role.name.lower() != "admin":
        raise HTTPException(status_code=409, detail="The applicant does not have the school admin role.")

    now = datetime.now(timezone.utc)
    school.status = SchoolStatus.ACTIVE
    school.is_active = True
    user.status = UserStatus.ACTIVE
    user.is_active = True
    membership.status = MembershipStatus.ACTIVE
    membership.is_active = True
    membership.activated_at = now
    application.status = ApplicationStatus.APPROVED
    application.reviewed_by = reviewer_id
    application.reviewed_by_name = _reviewer_name(reviewer_id, session)
    application.reviewed_at = now
    application.updated_at = now

    session.add(PlatformActivityLog(
        activity_type="SCHOOL_APPLICATION_APPROVED",
        message=f"Approved school application {application.id}.",
        performed_by=reviewer_id,
    ))
    session.add_all([school, user, membership, application])
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise
    session.refresh(application)
    return application


def reject_school_application(
    application_id,
    reviewer_id,
    payload: SchoolApplicationRejectRequest,
    session: Session,
) -> SchoolApplication:
    application = _get_application(application_id, session)
    school = session.get(School, application.school_id)
    user = session.get(User, application.applicant_user_id)
    membership = session.exec(
        select(UserSchoolLink).where(
            UserSchoolLink.user_id == application.applicant_user_id,
            UserSchoolLink.school_id == application.school_id,
        )
    ).first()
    if not school or not user or not membership:
        raise HTTPException(status_code=409, detail="Application onboarding records are incomplete.")

    now = datetime.now(timezone.utc)
    school.status = SchoolStatus.REJECTED
    school.is_active = False
    user.status = UserStatus.DEACTIVATED
    user.is_active = False
    membership.status = MembershipStatus.REVOKED
    membership.is_active = False
    application.status = ApplicationStatus.REJECTED
    application.reviewed_by = reviewer_id
    application.reviewed_by_name = _reviewer_name(reviewer_id, session)
    application.reviewed_at = now
    application.rejection_reason = payload.rejection_reason.strip()
    application.updated_at = now

    session.add(PlatformActivityLog(
        activity_type="SCHOOL_APPLICATION_REJECTED",
        message=f"Rejected school application {application.id}.",
        performed_by=reviewer_id,
    ))
    session.add_all([school, user, membership, application])
    try:
        session.commit()
    except Exception:
        session.rollback()
        raise
    session.refresh(application)
    return application
