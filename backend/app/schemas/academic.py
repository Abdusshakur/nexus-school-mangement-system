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


class ClassWithTeacherResponse(BaseModel):
    id: UUID
    name: str
    form_teacher_id: Optional[UUID] = None
    form_teacher_name: str

from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from uuid import UUID
from backend.app.models import TermEnum

# ==========================================
# ACADEMIC SESSION SCHEMAS (The Year)
# ==========================================
class AcademicSessionBase(BaseModel):
    name: str # e.g., "2026/2027"
    start_date: date
    end_date: date
    is_active: bool = False

class AcademicSessionCreate(AcademicSessionBase):
    pass

class AcademicSessionResponse(AcademicSessionBase):
    id: UUID
    
# ==========================================
# ACADEMIC TERM SCHEMAS (The Terms)
# ==========================================
class AcademicTermBase(BaseModel):
    name: TermEnum
    start_date: date
    end_date: date
    is_active: bool = False

class AcademicTermCreate(AcademicTermBase):
    session_id: UUID

class AcademicTermResponse(AcademicTermBase):
    id: UUID
    session_id: UUID
    session_name: str # Flattened for the frontend!

# ==========================================
# AGGREGATE DASHBOARD SCHEMA
# ==========================================
class ActiveContextSummary(BaseModel):
    active_session_name: str
    active_term_name: str
    term_id: UUID
    session_id: UUID
    total_students: int
    total_classes: int
    active_teachers: int
    total_subjects: int

class TermWithSessionResponse(BaseModel):
    term_id: UUID
    term_name: str
    term_start_date: date
    term_end_date: date
    is_term_active: bool
    
    session_id: UUID
    session_name: str
    is_session_active: bool