from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID
from backend.app.models import PeriodStatus  # 👈 Import the new lifecycle enum


# --- Schemas ---
class AcademicEntityCreate(BaseModel):
    name: str

class AcademicEntityUpdate(BaseModel):
    name: str

class AcademicEntityResponse(BaseModel):
    id: UUID
    name: str


class SubjectCreate(BaseModel):
    name: str = Field(min_length=1)
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    code: Optional[str] = None
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    id: UUID
    name: str
    code: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime

class FormTeacherAssignRequest(BaseModel):
    teacher_id: Optional[UUID] = None  # Allows passing null to unassign a teacher


class ClassWithTeacherResponse(BaseModel):
    id: UUID
    name: str
    form_teacher_id: Optional[UUID] = None
    form_teacher_name: str

# ==========================================
# ACADEMIC SESSION SCHEMAS (The Year)
# ==========================================
class AcademicSessionBase(BaseModel):
    name: str # e.g., "2026/2027"
    start_date: date
    end_date: date
    status: PeriodStatus = PeriodStatus.DRAFT  # 👈 Lifecycle state
    is_current: bool = False                   # 👈 Operational pointer

class AcademicSessionCreate(AcademicSessionBase):
    pass

class AcademicSessionResponse(AcademicSessionBase):
    id: UUID
    
# ==========================================
# ACADEMIC TERM SCHEMAS (The Terms)
# ==========================================
class AcademicTermBase(BaseModel):
    name: str             # e.g., "First Term", "Fall Semester"
    period_type: str      # e.g., "TERM", "SEMESTER", "QUARTER"
    sequence: int         # e.g., 1, 2, 3 (for sorting)
    start_date: date
    end_date: date
    status: PeriodStatus = PeriodStatus.DRAFT
    is_current: bool = False

class AcademicTermCreate(AcademicTermBase):
    # session_id is intentionally omitted here because it is passed in the URL path
    pass

class AcademicTermResponse(AcademicTermBase):
    id: UUID
    session_id: UUID
    session_name: Optional[str] = None # Flattened for the frontend UI

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
    term_type: str
    term_start_date: date
    term_end_date: date
    term_status: PeriodStatus
    is_term_current: bool
    
    session_id: UUID
    session_name: str
    session_status: PeriodStatus
    is_session_current: bool
