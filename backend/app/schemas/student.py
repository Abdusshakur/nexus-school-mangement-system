
# backend/app/schemas/students.py
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date
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
    date_of_birth: date                  # Required!
    address: str                 # Required!
    phone_number: Optional[str] = None # Optional!
    class_name: str
    
    # Nested Parent Details (All Required)
    parent: ParentOnboardingDetails

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


class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: str
    admission_number: str
    class_name: str
    gender: str
    date_of_birth: date
    address: str                 # Required!
    phone_number: Optional[str] # Optional!
    created_at: datetime


# Add this schema to your file
class StudentProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    class_name: Optional[str] = None