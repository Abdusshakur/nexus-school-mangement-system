
# backend/app/schemas/students.py
from pydantic import BaseModel, EmailStr, field_validator, Field
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID

from backend.app.schemas.parent import ParentOnboardingDetails 


class UnifiedStudentOnboardingCreate(BaseModel):
    # Student Account Credentials & Info
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    gender: str
    date_of_birth: date                  # Required!
    address: str                         # Required!
    phone_number: Optional[str] = None   # Optional!
    
    # 🛠️ FIXED: Replaced class_name with class_id for Contextual Enrollment
    class_id: UUID 
    
    # This now uses the imported schema!
    parents: List[ParentOnboardingDetails] = Field(min_length=1, max_length=2)

    # 🛠️ Pydantic Validator to parse frontend strings cleanly
    @field_validator("date_of_birth", mode="before")
    @classmethod
    def parse_dob(cls, value):
        if isinstance(value, str):
            # If frontend sends standard ISO format (e.g. "2026-07-22" or "2026-07-22T...Z")
            if "T" in value:
                value = value.split("T")[0] # Strip off the time part
            
            # If frontend sends DD-MM-YYYY or DD/MM/YYYY
            try:
                if "/" in value:
                    # Handles 22/07/2026
                    return datetime.strptime(value, "%d/%m/%Y").date()
                if "-" in value and len(value.split("-")[0]) == 2:
                    # Handles 22-07-2026
                    return datetime.strptime(value, "%d-%m-%Y").date()
            except ValueError:
                raise ValueError("Invalid date format. Expected YYYY-MM-DD or DD/MM/YYYY")
        
        return value


# ------------------------------------------------------------------
# Parent Link Schema
# ------------------------------------------------------------------
class LinkedParentResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    phone_number: str
    address: Optional[str] = None
    email: str
    relationship_type: str  # e.g., "GUARDIAN", "FATHER", "MOTHER"


class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: str
    admission_number: str
    
    # Note: We keep class_name here because the backend dynamically injects it!
    class_name: str 
    
    gender: str
    date_of_birth: date
    address: str                 
    phone_number: Optional[str] 
    created_at: datetime


class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    # ❌ class_name has been removed. Class changes must use an enrollment transfer workflow!


# ------------------------------------------------------------------
# Detailed Student Schema (For single student lookups)
# ------------------------------------------------------------------
class StudentDetailResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: str
    admission_number: str
    
    # Kept for dynamic backend injection
    class_name: str
    
    gender: str
    date_of_birth: date
    phone_number: Optional[str] = None
    address: str
    created_at: datetime
    # Nested relationship
    parents: List[LinkedParentResponse] = []


class TransferStudentRequest(BaseModel):
    class_id: UUID
    session_id: UUID
    term_id: UUID

class BulkTransferStudentRequest(BaseModel):
    student_ids: List[UUID]
    class_id: UUID
    session_id: UUID
    term_id: UUID

from datetime import datetime
from backend.app.models import EnrollmentStatus

class StudentEnrollmentHistoryResponse(BaseModel):
    id: UUID
    class_id: UUID
    class_name: str
    session_id: UUID
    session_name: str
    term_id: UUID
    term_name: str
    status: EnrollmentStatus
    created_at: datetime
