"""Public school onboarding and Super Admin application review endpoints."""

from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from backend.app.core.auth_utils import CurrentContext, require_super_admin
from backend.app.db.database import get_session
from backend.app.models import ApplicationStatus, SchoolApplication
from backend.app.schemas.school_application import (
    SchoolApplicationRejectRequest,
    SchoolApplicationResponse,
    SchoolApplicationSignupRequest,
    SchoolApplicationSubmitResponse,
)
from backend.app.schemas_events import BaseEvent
from backend.app.services.publisher import publish_event
from backend.app.services.school_onboarding_service import (
    approve_school_application,
    reject_school_application,
    submit_school_application,
)


router = APIRouter(prefix="/school-applications", tags=["School Onboarding"])
platform_router = APIRouter(
    prefix="/platform/school-applications",
    tags=["School Application Review"],
)


@router.post(
    "",
    response_model=SchoolApplicationSubmitResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a school onboarding application",
    description="Create a pending school and owner account for Super Admin review. No login token is issued.",
)
def submit_application(
    payload: SchoolApplicationSignupRequest,
    session: Session = Depends(get_session),
):
    application = submit_school_application(payload, session)
    publish_event(BaseEvent(
        event_type="school_application_submitted",
        payload={
            "application_id": str(application.id),
            "school_id": str(application.school_id),
            "applicant_user_id": str(application.applicant_user_id),
        },
    ))
    return SchoolApplicationSubmitResponse(
        application_id=application.id,
        school_id=application.school_id,
        applicant_user_id=application.applicant_user_id,
        status=application.status,
        message="Your school application has been submitted for review.",
    )


@platform_router.get(
    "",
    response_model=List[SchoolApplicationResponse],
    summary="List school onboarding applications",
)
def list_applications(
    application_status: Optional[ApplicationStatus] = Query(None, alias="status"),
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    statement = select(SchoolApplication)
    if application_status:
        statement = statement.where(SchoolApplication.status == application_status)
    return session.exec(
        statement.order_by(SchoolApplication.created_at.desc())
    ).all()


@platform_router.get(
    "/{application_id}",
    response_model=SchoolApplicationResponse,
    summary="Get a school onboarding application",
)
def get_application(
    application_id: UUID,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    application = session.get(SchoolApplication, application_id)
    if not application:
        raise HTTPException(status_code=404, detail="School application not found.")
    return application


@platform_router.post(
    "/{application_id}/approve",
    response_model=SchoolApplicationResponse,
    summary="Approve a school onboarding application",
)
def approve_application(
    application_id: UUID,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    return approve_school_application(application_id, context.user_id, session)


@platform_router.post(
    "/{application_id}/reject",
    response_model=SchoolApplicationResponse,
    summary="Reject a school onboarding application",
)
def reject_application(
    application_id: UUID,
    payload: SchoolApplicationRejectRequest,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    return reject_school_application(application_id, context.user_id, payload, session)
