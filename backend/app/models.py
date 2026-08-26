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
    class_id: UUID = Field(foreign_key="class.id", index=True)
    
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    end_date: Optional[date] = None
    status: EnrollmentStatus = Field(default=EnrollmentStatus.ACTIVE)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    student: "StudentProfile" = Relationship(back_populates="enrollments")
    academic_session: "AcademicSession" = Relationship()
    academic_term: "AcademicTerm" = Relationship()
    enrolled_class: "Class" = Relationship()


class TeacherAssignment(SQLModel, table=True):
    """Links a teacher to a subject and a class for a specific academic period."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    class_id: UUID = Field(foreign_key="class.id", index=True)
    subject_id: UUID = Field(foreign_key="subject.id", index=True)
    
    start_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    end_date: Optional[date] = None
    status: AssignmentStatus = Field(default=AssignmentStatus.ACTIVE)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationships
    teacher: "TeacherProfile" = Relationship(back_populates="assignments")
    academic_session: "AcademicSession" = Relationship()
    academic_term: "AcademicTerm" = Relationship()
    assigned_class: "Class" = Relationship()
    subject: "Subject" = Relationship()

# ==================================================================
# GRANULAR RBAC PERMISSION MODELS
# ==================================================================

class Permission(SQLModel, table=True):
    """Atomic actions a user can perform in the system."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True) # e.g., "timetable:write", "student:delete"
    description: Optional[str] = None

class RolePermissionLink(SQLModel, table=True):
    """Pivot table mapping Roles to Permissions."""
    role_id: UUID = Field(foreign_key="role.id", primary_key=True)
    permission_id: UUID = Field(foreign_key="permission.id", primary_key=True)

class Role(SQLModel, table=True):
    """A collection of permissions (e.g., 'Principal', 'Class Teacher', 'Parent')."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True) 
    description: Optional[str] = None
    
    # Relationship to permissions
    permissions: List["Permission"] = Relationship(
        back_populates="roles", link_model=RolePermissionLink)



# ==================================================================
# 3. ACADEMIC INFRASTRUCTURE (Tenant-Scoped)
# ==================================================================

from sqlalchemy import Index, text

class AcademicSession(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("name", "school_id", name="uq_session_name_per_school"),
        # 👇 The Partial Unique Index: Only ONE session can be current per school
        Index(
            "ix_unique_current_session_per_school", 
            "school_id", 
            unique=True, 
            postgresql_where=text("is_current = true")
        ),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    name: str = Field(index=True) 
    start_date: date
    end_date: date
    
    # 👇 Replaced the rigid is_active boolean with the dual-state system
    status: PeriodStatus = Field(default=PeriodStatus.DRAFT)
    is_current: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    terms: List["AcademicTerm"] = Relationship(back_populates="session")


class AcademicTerm(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint("name", "session_id", "school_id", name="uq_term_name_per_session"),
        # 👇 The Partial Unique Index: Only ONE term can be current per school at a time
        Index(
            "ix_unique_current_term_per_school", 
            "school_id", 
            unique=True, 
            postgresql_where=text("is_current = true")
        ),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    session_id: UUID = Field(foreign_key="academicsession.id")
    
    name: str = Field(index=True)     # "First Term", "Fall Semester"
    period_type: str                  # "TERM", "SEMESTER", "QUARTER"
    sequence: int                     # 1, 2, 3 (Ensures chronological sorting)
    
    start_date: date
    end_date: date
    
    # 👇 Dual-state system
    status: PeriodStatus = Field(default=PeriodStatus.DRAFT)
    is_current: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    session: AcademicSession = Relationship(back_populates="terms")

class Class(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("name", "school_id", name="uq_class_name_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    name: str = Field(index=True) 
    form_teacher_id: UUID | None = Field(default=None, foreign_key="teacherprofile.id") 
    
    # Optional: If you want a direct relationship or if it's handled strictly via TeacherAssignment/Enrollments
    # We remove the link_model since the old link table is gone.


class Subject(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("name", "school_id", name="uq_subject_name_per_school"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    name: str = Field(index=True) 
    # Removed link_model="TeacherSubjectLink" as well!


# ==================================================================
# 4. OPERATIONS (Tenant-Scoped)
# ==================================================================

class TimetableEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    
    class_id: UUID = Field(foreign_key="class.id")
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
    class_id: UUID = Field(foreign_key="class.id")
    attendance_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    status: SessionStatus = Field(default=SessionStatus.SUBMITTED)
    
    recorded_by_id: UUID = Field(foreign_key="user.id") 
    approved_by_id: UUID | None = Field(default=None, foreign_key="user.id")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AttendanceRecord(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("session_id", "student_id", name="unique_student_per_session"),)
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    school_id: UUID = Field(foreign_key="school.id", index=True)
    
    session_id: UUID = Field(foreign_key="attendancesession.id", ondelete="CASCADE")
    student_id: UUID = Field(foreign_key="studentprofile.id")
    
    status: AttendanceStatus
    remarks: str | None = Field(default=None) 


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