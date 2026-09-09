from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from backend.app.models import ApplicationStatus


class SchoolApplicationCreate(BaseModel):
    school_id: UUID
    applicant_user_id: UUID
    school_name: str = Field(min_length=1)
    applicant_name: str = Field(min_length=1)


class SchoolApplicationSignupRequest(BaseModel):
    school_name: str = Field(min_length=1)
    school_email: EmailStr
    school_phone: Optional[str] = None
    full_physical_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "Nigeria"
    timezone: str = "Africa/Lagos"
    owner_first_name: str = Field(min_length=1)
    owner_last_name: str = Field(min_length=1)
    owner_email: EmailStr
    owner_password: str = Field(min_length=8)
    owner_phone: Optional[str] = None


class SchoolApplicationSubmitResponse(BaseModel):
    application_id: UUID
    school_id: UUID
    applicant_user_id: UUID
    status: ApplicationStatus
    message: str


class SchoolApplicationRejectRequest(BaseModel):
    rejection_reason: str = Field(min_length=1)


class SchoolApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_id: UUID
    applicant_user_id: UUID
    status: ApplicationStatus
    school_name: str
    applicant_name: str
    reviewed_by: Optional[UUID] = None
    reviewed_by_name: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
