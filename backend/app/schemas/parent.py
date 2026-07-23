# backend/app/schemas/parent.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


from backend.app.models import RelationshipType

# ------------------------------------------------------------------
# 1. Used inside Student Onboarding
# ------------------------------------------------------------------
class ParentOnboardingDetails(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    relationship_type: RelationshipType
    is_primary_contact: bool = False
    is_financial_sponsor: bool = False


# ------------------------------------------------------------------
# 2. Standalone Parent Management (Admin creating/updating a parent directly)
# ------------------------------------------------------------------
class ParentCreateRequest(BaseModel):
    """Payload for creating a parent without a student attached yet."""
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str

class ParentProfileUpdate(BaseModel):
    """Payload for updating an existing parent's details."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None


# ------------------------------------------------------------------
# 3. Parent Responses
# ------------------------------------------------------------------
class ParentResponse(BaseModel):
    """Standard response when viewing a parent profile."""
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    created_at: datetime

# ------------------------------------------------------------------
# Student Link Schema
# ------------------------------------------------------------------
class LinkedStudentResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    admission_number: str
    class_name: str
    relationship_type: str # e.g., "MOTHER", "FATHER" (How this parent is related to this specific student)

# ------------------------------------------------------------------
# Detailed Parent Schema (For single parent lookups)
# ------------------------------------------------------------------
class ParentDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    created_at: datetime
    
    # Nested relationship
    students: List[LinkedStudentResponse] = []