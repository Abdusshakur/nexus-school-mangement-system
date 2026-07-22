from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

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

class ParentStudentLink(SQLModel, table=True):
    parent_id: UUID = Field(foreign_key="parentprofile.id", primary_key=True)
    student_id: UUID = Field(foreign_key="studentprofile.id", primary_key=True)
    relationship_type: str
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
    date_of_birth: datetime
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

class Attendance(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    student_id: UUID = Field(foreign_key="studentprofile.id", index=True)
    class_name: str  # Matches the student's class name string for simplified MVP grouping
    status: AttendanceStatus
    attendance_date: datetime = Field(index=True)
    recorded_by: UUID = Field(foreign_key="user.id") # Tracks which teacher/admin took attendance
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Announcement(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    content: str
    status: str = Field(default="DRAFT") # DRAFT, PUBLISHED, ARCHIVED
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

