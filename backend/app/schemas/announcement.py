# backend/app/schemas/announcement.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    status: Optional[str] = "DRAFT"  # DRAFT, PUBLISHED, ARCHIVED

class AnnouncementResponse(BaseModel):
    id: UUID
    title: str
    content: str
    status: str
    author_id: UUID
    created_at: datetime