# backend/app/schemas/student.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class StudentCreate(BaseModel):
    email: EmailStr
    password: str
    admission_number: str
    class_name: str

class StudentResponse(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    admission_number: str
    class_name: str
    created_at: datetime