from datetime import datetime, timezone
from enum import Enum
from typing import List
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    parents: List["ParentProfile"] = Relationship(
        back_populates="students",
        link_model=ParentStudentLink,
    )


class ParentProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)
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