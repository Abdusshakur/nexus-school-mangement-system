# backend/app/schemas/announcement.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from backend.app.models import PriorityEnum, AnnouncementStatus

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    category: str
    audience: str
    priority: PriorityEnum = PriorityEnum.MEDIUM
    status: AnnouncementStatus = AnnouncementStatus.DRAFT

class AnnouncementResponse(BaseModel):
    id: UUID
    title: str
    content: str
    category: str
    audience: str
    priority: PriorityEnum
    status: AnnouncementStatus
    author_id: UUID
    author_name: Optional[str] = None
    author_role: Optional[str] = None
    school_id: UUID  # 👈 Added so the frontend can properly route UI data
    created_at: datetime


class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    audience: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[AnnouncementStatus] = None
