# backend/app/routers/announcements.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List
from backend.app.db.database import get_session
from backend.app.models import Announcement
from backend.app.schemas.announcement import AnnouncementCreate, AnnouncementResponse
from backend.app.core.auth_utils import RoleChecker, get_current_token_payload
from backend.app.schemas_events import BaseEvent
from backend.app.services.publisher import publish_event

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"]
)

# Protect write access: Only staff can create announcements
allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AnnouncementResponse)
def create_announcement(
    request: AnnouncementCreate,
    session: Session = Depends(get_session),
    current_user: dict = Depends(allow_staff_only)
):
    """Creates a new school announcement notice and fires an alert event."""
    staff_user_id = current_user.get("user_id")
    if not staff_user_id:
        raise HTTPException(status_code=401, detail="Invalid token properties")

    # 1. Stage the entry in PostgreSQL
    db_announcement = Announcement(
        title=request.title,
        content=request.content,
        status=request.status,
        author_id=staff_user_id
    )
    session.add(db_announcement)
    session.commit()
    session.refresh(db_announcement)

    # 2. Trigger our background event megaphone if it's set to PUBLISHED immediately
    if db_announcement.status == "PUBLISHED":
        event = BaseEvent(
            event_type="announcement_published",
            payload={
                "announcement_id": str(db_announcement.id),
                "title": db_announcement.title,
                "author_id": str(db_announcement.author_id)
            }
        )
        publish_event(event)

    return db_announcement

@router.get("/", response_model=List[AnnouncementResponse])
def list_announcements(
    status_filter: str = Query("PUBLISHED", alias="status", description="Filter by status"),
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_token_payload) # Anyone with a valid token can read!
):
    """Lists system announcements. Open to all authenticated campus roles."""
    announcements = session.query(Announcement).filter(Announcement.status == status_filter).all()
    return announcements