from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from uuid import UUID
from backend.app.models import AttendanceStatus

# ==========================================
# 1. ATTENDANCE SUBMISSION SCHEMAS
# ==========================================
class StudentAttendanceInput(BaseModel):
    student_id: UUID
    status: AttendanceStatus
    remarks: Optional[str] = None

class AttendanceSubmitRequest(BaseModel):
    class_id: UUID
    academic_session_id: UUID  # 👈 Temporal Anchor (Year)
    academic_term_id: UUID     # 👈 Temporal Anchor (Term)
    attendance_date: date
    records: List[StudentAttendanceInput]
    
class AttendanceSubmitResponse(BaseModel):
    message: str
    session_id: UUID
    records_processed: int

# ==========================================
# 2. ATTENDANCE SUMMARY SCHEMAS (For the Dashboard)
# ==========================================
class ClassAttendanceSummary(BaseModel):
    class_id: UUID
    class_name: str
    form_teacher_name: str
    total_students: int
    session_status: str # "SUBMITTED" or "PENDING"
    total_present: int
    total_absent: int
    total_late: int
    attendance_rate_percentage: float

class DailyAttendanceSummaryResponse(BaseModel):
    date: date
    academic_session_id: UUID  # 👈 Temporal Anchor (Year)
    academic_term_id: UUID     # 👈 Temporal Anchor (Term)
    classes: List[ClassAttendanceSummary]