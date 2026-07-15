
# backend/app/schemas/students.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class ParentOnboardingDetails(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str

class UnifiedStudentOnboardingCreate(BaseModel):
    # Student Account Credentials & Info
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    gender: str                  # Required!
    address: str                 # Required!
    phone_number: Optional[str] = None # Optional!
    class_name: str
    
    # Nested Parent Details (All Required)
    parent: ParentOnboardingDetails

class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    email: str
    admission_number: str
    class_name: str
    created_at: datetime