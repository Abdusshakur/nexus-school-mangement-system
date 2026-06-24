# backend/app/schemas/relationship.py
from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class RelationshipCreate(BaseModel):
    parent_id: UUID
    student_id: UUID
    relationship_type: str  # e.g., "MOTHER", "FATHER", "GUARDIAN"

class RelationshipResponse(BaseModel):
    parent_id: UUID
    student_id: UUID
    relationship_type: Optional[str] = None
    message: str