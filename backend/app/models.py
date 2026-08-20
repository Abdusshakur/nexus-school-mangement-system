from datetime import datetime, timezone, date, time
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"


class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    teacher_profile: Optional["TeacherProfile"] = Relationship(
        back_populates="user",
        sa_relationship_kwargs={"uselist": False}  # Enforces a strict 1-to-1 mapping!
    )

class RelationshipType(str, Enum):
    MOTHER = "MOTHER"
    FATHER = "FATHER"
    GUARDIAN = "GUARDIAN"
    STEP_MOTHER = "STEP_MOTHER"
    STEP_FATHER = "STEP_FATHER"
    RELATIVE = "RELATIVE"
    OTHER = "OTHER"

class ParentStudentLink(SQLModel, table=True):
    parent_id: UUID = Field(foreign_key="parentprofile.id", primary_key=True)
    student_id: UUID = Field(foreign_key="studentprofile.id", primary_key=True)
    
    relationship_type: RelationshipType
    is_primary_contact: bool = Field(default=False)
    is_financial_sponsor: bool = Field(default=False)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StudentProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    admission_number: str = Field(index=True, unique=True)
    class_name: str
    first_name: str = Field(index=True) # Added index for faster search operations!
    last_name: str = Field(index=True)  # Added index for faster search operations!
    gender: str                         # e.g., "MALE", "FEMALE"
    address: str
    date_of_birth: date
    phone_number: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Many-to-Many Relationship Link
    parents: List["ParentProfile"] = Relationship(
        back_populates="students",
        link_model=ParentStudentLink,
    )

class ParentProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    first_name: str                     
    last_name: str
    phone_number: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    students: List["StudentProfile"] = Relationship(
        back_populates="parents",
        link_model=ParentStudentLink,
    )

class AttendanceStatus(str, Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"

class SessionStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"


class AttendanceSession(SQLModel, table=True):
    """The master record for a class on a specific day."""
    __table_args__ = (
        UniqueConstraint("class_id", "attendance_date", name="unique_class_date_session"),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    class_id: UUID = Field(foreign_key="class.id")
    attendance_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    
    status: SessionStatus = Field(default=SessionStatus.SUBMITTED)
    
    # Audit trail
    recorded_by_id: UUID = Field(foreign_key="user.id") # Who actually took it
    approved_by_id: UUID | None = Field(default=None, foreign_key="user.id")
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class AttendanceRecord(SQLModel, table=True):
    """The individual present/absent status for a single student."""
    __table_args__ = (
        UniqueConstraint("session_id", "student_id", name="unique_student_per_session"),
    )
    
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="attendancesession.id", ondelete="CASCADE")
    student_id: UUID = Field(foreign_key="studentprofile.id")
    
    status: AttendanceStatus
    remarks: str | None = Field(default=None) # E.g., "Arrived at 9:30 AM due to traffic"

from enum import Enum
from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field

class PriorityEnum(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class AnnouncementStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"

class Announcement(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    content: str
    
    # New flexible fields for the UI mapping
    category: str 
    audience: str 
    
    # Enums for strict control
    priority: PriorityEnum = Field(default=PriorityEnum.MEDIUM)
    status: AnnouncementStatus = Field(default=AnnouncementStatus.DRAFT)
    
    author_id: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ActivityLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    activity_type: str # e.g., "STUDENT_CREATED", "ATTENDANCE_RECORDED"
    message: str       # Descriptive string: "Teacher Jane marked John Doe as ABSENT"
    performed_by: UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ------------------------------------------------------------------
# 1. Junction Tables (Link Models)
# ------------------------------------------------------------------

class TeacherClassLink(SQLModel, table=True):
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", primary_key=True)
    class_id: UUID = Field(foreign_key="class.id", primary_key=True)


class TeacherSubjectLink(SQLModel, table=True):
    teacher_id: UUID = Field(foreign_key="teacherprofile.id", primary_key=True)
    subject_id: UUID = Field(foreign_key="subject.id", primary_key=True)


# ------------------------------------------------------------------
# 2. Main TeacherProfile Model
# ------------------------------------------------------------------

class TeacherProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    
    # Personal & Professional Details
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    phone_number: str
    gender: str                        # e.g., "MALE", "FEMALE"
    address: str
    department: str = Field(index=True) # e.g., "Sciences", "Humanities"
    qualification: str                 # e.g., "B.Ed Mathematics", "M.Sc Physics"
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    user: Optional["User"] = Relationship(back_populates="teacher_profile")
    
    classes: List["Class"] = Relationship(
        back_populates="teachers",
        link_model=TeacherClassLink
    )
    
    subjects: List["Subject"] = Relationship(
        back_populates="teachers",
        link_model=TeacherSubjectLink
    )

class Class(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True) # e.g., "Grade 10-A"
    
    # The single Form Teacher who takes morning attendance
    form_teacher_id: UUID | None = Field(default=None, foreign_key="teacherprofile.id") 
    
    # All the teachers who teach various subjects in this class
    teachers: List["TeacherProfile"] = Relationship(
        back_populates="classes",
        link_model=TeacherClassLink
    )

class Subject(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(unique=True, index=True) # e.g., "Mathematics"
    
    teachers: List["TeacherProfile"] = Relationship(
        back_populates="subjects",
        link_model=TeacherSubjectLink
    )

class AdminProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
    first_name: str
    last_name: str
    phone_number: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ClassSubjectAssignment(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    teacher_id: UUID = Field(foreign_key="teacherprofile.id")
    class_id: UUID = Field(foreign_key="class.id")
    subject_id: UUID = Field(foreign_key="subject.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DayOfWeek(str, Enum):
    MONDAY = "MONDAY"
    TUESDAY = "TUESDAY"
    WEDNESDAY = "WEDNESDAY"
    THURSDAY = "THURSDAY"
    FRIDAY = "FRIDAY"

class TimetableEntry(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    term_id: UUID = Field(foreign_key="academicterm.id", index=True)
    
    # The 3 Pillars of the Event
    class_id: UUID = Field(foreign_key="class.id")
    subject_id: UUID = Field(foreign_key="subject.id")
    teacher_id: UUID = Field(foreign_key="teacherprofile.id")
    
    # The Temporal Data
    day_of_week: DayOfWeek
    start_time: time
    end_time: time


class AcademicSession(SQLModel, table=True):
    """The Parent: Represents the entire school year (e.g., 2026/2027)"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True, unique=True) # e.g., "2026/2027"
    start_date: date
    end_date: date
    is_active: bool = Field(default=False) # Is this the current school year?
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Link to the child terms
    terms: List["AcademicTerm"] = Relationship(back_populates="session")


class TermEnum(str, Enum):
    FIRST = "First Term"
    SECOND = "Second Term"
    THIRD = "Third Term"

class AcademicTerm(SQLModel, table=True):
    """The Child: Represents the specific term inside a session"""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="academicsession.id")
    name: TermEnum
    start_date: date
    end_date: date
    is_active: bool = Field(default=False) # Is this the exact current term?
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Link back to the parent session
    session: AcademicSession = Relationship(back_populates="terms")
