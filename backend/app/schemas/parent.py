# backend/app/schemas/parent.py
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class ParentCreate(BaseModel):
    email: EmailStr
    password: str
    phone_number: str

class ParentResponse(BaseModel):
    id: UUID
    user_id: UUID
    email: EmailStr
    phone_number: str
    created_at: datetime