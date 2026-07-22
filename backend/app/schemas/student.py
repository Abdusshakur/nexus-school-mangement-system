
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
    gender: str
    date_of_birth: datetime                  # Required!
    address: str                 # Required!
    phone_number: Optional[str] = None # Optional!
    class_name: str
    
    # Nested Parent Details (All Required)
    parent: ParentOnboardingDetails

class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: str
    admission_number: str
    class_name: str
    gender: str
    date_of_birth: datetime
    created_at: datetime


# Add this schema to your file
class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    class_name: Optional[str] = None