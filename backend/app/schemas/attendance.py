from pydantic import BaseModel, Field, model_validator
from typing import List, Literal, Optional
from datetime import date, time
from uuid import UUID
from backend.app.models import AttendanceStatus, SessionStatus


class TeacherAttendanceConfigurationBase(BaseModel):
    check_in_start: time
    expected_check_in_time: time
    check_in_end: time
    late_threshold: time
    check_out_start: time
    expected_check_out_time: time
    check_out_end: time
    qr_rotation_seconds: int = Field(default=300, ge=30, le=86400)

    @model_validator(mode="after")
    def validate_windows(self):
        if not (
            self.check_in_start <= self.expected_check_in_time <= self.check_in_end
        ):
            raise ValueError("Check-in times must be start <= expected <= end.")
        if self.late_threshold < self.expected_check_in_time:
            raise ValueError("late_threshold cannot be before expected_check_in_time.")
        if not (
            self.check_out_start <= self.expected_check_out_time <= self.check_out_end
        ):
            raise ValueError("Check-out times must be start <= expected <= end.")
        return self


class TeacherAttendanceConfigurationCreate(TeacherAttendanceConfigurationBase):
    pass


class TeacherAttendanceConfigurationUpdate(BaseModel):
    check_in_start: Optional[time] = None
    expected_check_in_time: Optional[time] = None
    check_in_end: Optional[time] = None
    late_threshold: Optional[time] = None
    check_out_start: Optional[time] = None
    expected_check_out_time: Optional[time] = None
    check_out_end: Optional[time] = None
    qr_rotation_seconds: Optional[int] = Field(default=None, ge=30, le=86400)


class TeacherAttendanceConfigurationResponse(TeacherAttendanceConfigurationBase):
    school_id: UUID
    id: UUID

    model_config = {"from_attributes": True}

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
    attendance_session_id: Optional[UUID] = None
    attendance_status: Optional[SessionStatus] = None
    students: List[StudentAttendanceItem]


class ParentAttendanceResponse(BaseModel):
    attendance_session_id: UUID
    date: date
    class_id: UUID
    class_name: str
    status: AttendanceStatus
    remarks: Optional[str] = None
    session_status: SessionStatus

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
from backend.app.models import AttendanceMethod, StaffAttendanceStatus, QRType

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
    is_late: bool = False
    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None
    check_in_method: Optional[AttendanceMethod] = None
    check_out_method: Optional[AttendanceMethod] = None
    duration_minutes: Optional[int] = None


class TeacherAttendanceHistoryItem(BaseModel):
    attendance_date: date
    status: StaffAttendanceStatus
    is_late: bool = False
    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None
    check_in_method: Optional[AttendanceMethod] = None
    check_out_method: Optional[AttendanceMethod] = None
    duration_minutes: Optional[int] = None
    academic_session_id: Optional[UUID] = None
    term_id: Optional[UUID] = None

    model_config = {"from_attributes": True}


class TeacherAttendanceStatsResponse(BaseModel):
    period: str
    attendance_rate: float
    present_days: int
    late_days: int
    absent_days: int
    total_working_days: int


class TeacherAttendanceAdminItem(TeacherAttendanceHistoryItem):
    teacher_id: UUID
    teacher_name: str
    teacher_email: str


class TeacherAttendanceQRCurrentResponse(BaseModel):
    id: UUID
    attendance_date: date
    qr_type: QRType
    valid_from: datetime
    expires_at: datetime
    is_active: bool

    model_config = {"from_attributes": True}


class TeacherAttendanceCorrectionRequest(BaseModel):
    action: Literal["CHECK_IN", "CHECK_OUT"]
    timestamp: datetime
    reason: str = Field(min_length=1)


class MissedAttendanceResponse(BaseModel):
    attendance_date: date
    missed_check_ins: int
    missed_check_outs: int


class TeacherAttendanceActionResponse(BaseModel):
    message: str
    time: Optional[datetime] = None
    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None
