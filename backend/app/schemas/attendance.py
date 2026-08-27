from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from uuid import UUID
from backend.app.models import AttendanceStatus, SessionStatus

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


class StudentAttendanceItem(BaseModel):
    student_id: UUID
    admission_number: str
    first_name: str
    last_name: str
    status: Optional[AttendanceStatus] = None  # None if not marked yet
    remarks: Optional[str] = None

class ClassRosterResponse(BaseModel):
    class_id: UUID
    class_name: str
    date: date
    students: List[StudentAttendanceItem]

class AttendanceRecordSubmit(BaseModel):
    student_id: UUID
    status: AttendanceStatus
    remarks: Optional[str] = None

class AttendanceBatchSubmit(BaseModel):
    class_id: UUID
    date: date
    records: List[AttendanceRecordSubmit] = Field(min_length=1)


class AttendanceDecisionRequest(BaseModel):
    reason: Optional[str] = None


class AttendanceWorkflowResponse(BaseModel):
    message: str
    session_id: UUID
    status: SessionStatus


from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from backend.app.models import StaffAttendanceStatus, QRType

class QRGenerateRequest(BaseModel):
    qr_type: QRType

class QRGenerateResponse(BaseModel):
    raw_token: str
    expires_at: datetime
    qr_type: QRType

class AttendanceScanRequest(BaseModel):
    token: str = Field(min_length=1)

class TeacherTodayStatusResponse(BaseModel):
    date: date
    status: StaffAttendanceStatus
    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None


class TeacherAttendanceActionResponse(BaseModel):
    message: str
    time: Optional[datetime] = None
    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None
