from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
#

# --- Schemas ---
class AcademicEntityCreate(BaseModel):
    name: str

class AcademicEntityUpdate(BaseModel):
    name: str

class AcademicEntityResponse(BaseModel):
    id: UUID
    name: str

class FormTeacherAssignRequest(BaseModel):
    teacher_id: Optional[UUID] = None  # Allows passing null to unassign a teacher
