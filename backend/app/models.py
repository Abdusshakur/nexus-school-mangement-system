from datetime import datetime, timezone, date, time
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

# ==================================================================
# ENUMS
# ==================================================================
class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"

class RelationshipType(str, Enum):
    MOTHER = "MOTHER"
    FATHER = "FATHER"
    GUARDIAN = "GUARDIAN"
    STEP_MOTHER = "STEP_MOTHER"
    STEP_FATHER = "STEP_FATHER"
    RELATIVE = "RELATIVE"
    OTHER = "OTHER"

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"

class SessionStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    REJECTED = "REJECTED"
    APPROVED = "APPROVED"

class PriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class AnnouncementStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"

class DayOfWeek(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"

class PeriodStatus(str, Enum):
    DRAFT = "DRAFT"
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    ARCHIVED = "ARCHIVED"

class EnrollmentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    TRANSFERRED = "TRANSFERRED"  # Changed class mid-term
    WITHDRAWN = "WITHDRAWN"      # Left the school
    COMPLETED = "COMPLETED"      # Finished the term successfully

class AssignmentStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

# ==================================================================
# TEACHER ATTENDANCE ENUMS
# ==================================================================
class StaffAttendanceStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    MISSED_CHECK_IN = "MISSED_CHECK_IN"
    MISSED_CHECK_OUT = "MISSED_CHECK_OUT"
    MANUAL_REVIEW = "MANUAL_REVIEW"

class AttendanceMethod(str, Enum):
    QR = "QR"
    MANUAL = "MANUAL"
    SYSTEM = "SYSTEM"

class QRType(str, Enum):
    CHECK_IN = "CHECK_IN"
    CHECK_OUT = "CHECK_OUT"

class StaffAttendanceEventType(str, Enum):
    CHECK_IN = "CHECK_IN"
    CHECK_OUT = "CHECK_OUT"
    MANUAL_CHECK_IN = "MANUAL_CHECK_IN"
    MANUAL_CHECK_OUT = "MANUAL_CHECK_OUT"
    CORRECTION = "CORRECTION"

# ==================================================================
# 1. CORE TENANT & AUTHENTICATION MODELS
# ==================================================================

class School(SQLModel, table=True):
    """The root tenant model for the multi-school architecture."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Core Information
    name: str = Field(index=True)
    motto: Optional[str] = None
    year_established: Optional[int] = None
    accreditation_body: Optional[str] = None
    principal_name: Optional[str] = None
    
    # Contact Information
    email: str = Field(unique=True, index=True)
    phone_number: Optional[str] = None
    website: Optional[str] = None
    
    # Location Data
    full_physical_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = Field(default="Nigeria")
    
    # System Data
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SchoolSettings(SQLModel, table=True):
    """Stores tenant-specific configurations, including sequence trackers."""
    __table_args__ = (
        UniqueConstraint("school_id", name="uq_school_settings_school_id"),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True, unique=True)
    
    # Prefix for admission numbers (e.g., "GHS", "NEX")
    admission_prefix: str = Field(default="NEX")
    
    # The dedicated integer sequence tracker!
    current_admission_sequence: int = Field(default=0)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class User(SQLModel, table=True):
    """Global user identity. Notice there is no 'role' or 'school_id' here."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role_id: Optional[UUID] = Field(default=None, foreign_key="role.id")
    school_id: Optional[UUID] = Field(default=None, foreign_key="school.id")
    
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class UserSchoolLink(SQLModel, table=True):
    """Pivot table mapping a global user to a specific school workspace."""
    user_id: UUID = Field(foreign_key="user.id", primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", primary_key=True)
    
    # 👇 Changed from a string Enum to a Foreign Key pointing to the Role table!
    
    role_id: UUID = Field(foreign_key="role.id")
    is_active: bool = Field(default=True)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================================================================
# 2. USER PROFILE MODELS (Tenant-Scoped)
# ==================================================================

class AdminProfile(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "school_id", name="uq_admin_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    user_id: UUID = Field(foreign_key="user.id")
    
    first_name: str
    last_name: str
    phone_number: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeacherProfile(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "school_id", name="uq_teacher_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    user_id: UUID = Field(foreign_key="user.id")
    
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    phone_number: str
    gender: str 
    address: str
    department: str = Field(index=True) 
    qualification: str 
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    assignments: List["TeacherAssignment"] = Relationship(back_populates="teacher")

class ParentStudentLink(SQLModel, table=True):
    parent_id: UUID = Field(foreign_key="parentprofile.id", primary_key=True)
    student_id: UUID = Field(foreign_key="studentprofile.id", primary_key=True)
    
    relationship_type: RelationshipType
    is_primary_contact: bool = Field(default=False)
    is_financial_sponsor: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ParentProfile(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "school_id", name="uq_parent_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    user_id: UUID = Field(foreign_key="user.id")
    
    first_name: str                     
    last_name: str
    phone_number: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    students: List["StudentProfile"] = Relationship(back_populates="parents", link_model=ParentStudentLink)


class StudentProfile(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("user_id", "school_id", name="uq_student_per_school"),
        UniqueConstraint("admission_number", "school_id", name="uq_admission_number_per_school"),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    user_id: UUID = Field(foreign_key="user.id")
    
    admission_number: str = Field(index=True)
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)  
    gender: str                         
    address: str
    date_of_birth: date
    phone_number: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    parents: List["ParentProfile"] = Relationship(back_populates="students", link_model=ParentStudentLink)
    enrollments: List["StudentEnrollment"] = Relationship(back_populates="student")


class StudentEnrollment(SQLModel, table=True):
    """Links a student to a class for a specific academic period."""
    __table_args__ = (
        # A student can only have ONE active enrollment per term
        UniqueConstraint("student_id", "session_id", "term_id", name="uq_student_enrollment_per_term"),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    student_id: UUID = Field(foreign_key="studentprofile.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    class_id: UUID = Field(foreign_key="classes.id", index=True)
    
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    end_date: Optional[date] = None
    status: EnrollmentStatus = Field(default=EnrollmentStatus.ACTIVE)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    student: "StudentProfile" = Relationship(back_populates="enrollments")
    academic_session: "AcademicSession" = Relationship()
    academic_term: "AcademicTerm" = Relationship()
    enrolled_class: "SchoolClass" = Relationship()


class TeacherAssignment(SQLModel, table=True):
    """Links a teacher to a subject and a class for a specific academic period."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    class_id: UUID = Field(foreign_key="classes.id", index=True)
    subject_id: UUID = Field(foreign_key="subject.id", index=True)
    
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    end_date: Optional[date] = None
    status: AssignmentStatus = Field(default=AssignmentStatus.ACTIVE)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    teacher: "TeacherProfile" = Relationship(back_populates="assignments")
    academic_session: "AcademicSession" = Relationship()
    academic_term: "AcademicTerm" = Relationship()
    assigned_class: "SchoolClass" = Relationship()
    subject: "Subject" = Relationship()

# ==================================================================
# GRANULAR RBAC PERMISSION MODELS
# ==================================================================

class RolePermissionLink(SQLModel, table=True):
    """Pivot table mapping Roles to Permissions."""
    role_id: UUID = Field(foreign_key="role.id", primary_key=True)
    permission_id: UUID = Field(foreign_key="permission.id", primary_key=True)


class Permission(SQLModel, table=True):
    """Atomic actions a user can perform."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)
    description: Optional[str] = None

    roles: List["Role"] = Relationship(
        back_populates="permissions",
        link_model=RolePermissionLink,
    )


class Role(SQLModel, table=True):
    """A collection of permissions."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True)

    permissions: List[Permission] = Relationship(
        back_populates="roles",
        link_model=RolePermissionLink,
    )


# ==================================================================
# 3. ACADEMIC STRUCTURE & SESSIONS
# ==================================================================

class AcademicSession(SQLModel, table=True):
    """Represents an academic year (e.g., 2025/2026)."""
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_session_name_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    name: str = Field(index=True) # e.g., "2025/2026"
    start_date: date
    end_date: date
    status: PeriodStatus = Field(default=PeriodStatus.DRAFT)
    is_current: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AcademicTerm(SQLModel, table=True):
    """Represents a term/semester within an academic session (e.g., First Term)."""
    __table_args__ = (UniqueConstraint("school_id", "session_id", "name", name="uq_term_name_per_session"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    name: str = Field(index=True) # e.g., "First Term"
    period_type: str = Field(default="TERM")
    sequence: int = Field(default=1)
    start_date: date
    end_date: date
    status: PeriodStatus = Field(default=PeriodStatus.DRAFT)
    is_current: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Subject(SQLModel, table=True):
    """School subjects (e.g., Mathematics, Physics)."""
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_subject_name_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    name: str = Field(index=True)
    code: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SchoolClass(SQLModel, table=True):
    """Represents a class room/grade level (e.g., JSS 1A, SS 2 Science)."""
    __tablename__ = "classes"
    __table_args__ = (UniqueConstraint("school_id", "name", name="uq_class_name_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    name: str = Field(index=True)
    # Optional link to a designated form teacher
    form_teacher_id: Optional[UUID] = Field(default=None, foreign_key="teacherprofile.id", index=True)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
# Operational models retained for the API routers and integration tests.
class TimetableEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    class_id: UUID = Field(foreign_key="classes.id")
    subject_id: UUID = Field(foreign_key="subject.id")
    teacher_id: UUID = Field(foreign_key="teacherprofile.id")
    day_of_week: DayOfWeek
    start_time: time
    end_time: time


class AttendanceSession(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("class_id", "attendance_date", "school_id", name="unique_class_date_session_per_school"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    class_id: UUID = Field(foreign_key="classes.id")
    attendance_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    status: SessionStatus = Field(default=SessionStatus.SUBMITTED)
    recorded_by_id: UUID = Field(foreign_key="user.id")
    approved_by_id: Optional[UUID] = Field(default=None, foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AttendanceRecord(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("session_id", "student_id", name="unique_student_per_session"),)
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="attendancesession.id", ondelete="CASCADE")
    student_id: UUID = Field(foreign_key="studentprofile.id")
    status: AttendanceStatus
    remarks: Optional[str] = None


class Announcement(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    title: str
    content: str
    category: str
    audience: str
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    status: AnnouncementStatus = Field(default=AnnouncementStatus.DRAFT)
    author_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ActivityLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    activity_type: str
    message: str
    performed_by: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================================================================
# 4. TEACHER / STAFF ATTENDANCE MODELS (QR WORKFLOW)
# ==================================================================

class TeacherAttendanceSettings(SQLModel, table=True):
    """School-specific configurations for staff attendance windows."""
    __tablename__ = "teacher_attendance_settings"
    __table_args__ = (UniqueConstraint("school_id", name="uq_teacher_att_settings_school"),)

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)

    # Time boundaries (using datetime.time)
    check_in_start: time
    expected_check_in_time: time
    check_in_end: time
    late_threshold: time

    check_out_start: time
    expected_check_out_time: time
    check_out_end: time

    # How long a QR code remains valid before rotating (in seconds)
    qr_rotation_seconds: int = Field(default=300) # 5 minutes

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AttendanceQRSession(SQLModel, table=True):
    """Stores the active, short-lived QR tokens generated by the school admin."""
    __tablename__ = "attendance_qr_sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    attendance_date: date = Field(index=True)
    qr_type: QRType # CHECK_IN or CHECK_OUT
    
    token_hash: str = Field(index=True) # We store the hash, never the raw token in plaintext
    
    valid_from: datetime
    expires_at: datetime
    is_active: bool = Field(default=True)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeacherDailyAttendance(SQLModel, table=True):
    """The master daily attendance record for a teacher."""
    __tablename__ = "teacher_daily_attendance"
    __table_args__ = (
        # CRITICAL: A teacher can only have ONE attendance record per day per school
        UniqueConstraint("school_id", "teacher_id", "attendance_date", name="uq_teacher_daily_attendance"),
    )

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", index=True)
    
    # Optional temporal anchors for reporting
    academic_session_id: Optional[UUID] = Field(default=None, foreign_key="academicsession.id")
    term_id: Optional[UUID] = Field(default=None, foreign_key="academicterm.id")

    attendance_date: date = Field(index=True)

    check_in_at: Optional[datetime] = None
    check_out_at: Optional[datetime] = None

    status: StaffAttendanceStatus = Field(default=StaffAttendanceStatus.NOT_STARTED)

    check_in_method: Optional[AttendanceMethod] = None
    check_out_method: Optional[AttendanceMethod] = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TeacherAttendanceEvent(SQLModel, table=True):
    """Immutable audit log of every scan or manual correction."""
    __tablename__ = "teacher_attendance_events"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    daily_attendance_id: UUID = Field(foreign_key="teacher_daily_attendance.id", index=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", index=True)

    event_type: StaffAttendanceEventType
    event_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    method: AttendanceMethod
    
    # Stores reasons for manual corrections (e.g., "Forgot to scan, admin overrode")
    metadata_notes: Optional[str] = None 

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))