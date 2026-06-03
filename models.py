# models.py (Part 1)
from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List

class UserRole(str, Enum):
    ADMIN = "admin"
    TEACHER = "teacher"
    PARENT = "parent"
    STUDENT = "student"

# models.py (Part 2)

class User(SQLModel, table=True):
    # UUID primary key generated automatically on creation
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    
    # Index makes searching by email lightning fast; unique ensures no double signups
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole
    is_active: bool = True

    # Automatically records when a row is created
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# models.py (Part 3)

class ParentStudentLink(SQLModel, table=True):
    # Foreign key points directly to the lower-case 'parentprofile.id' table column
    parent_id: UUID = Field(foreign_key="parentprofile.id", primary_key=True)
    student_id: UUID = Field(foreign_key="studentprofile.id", primary_key=True)

    relationship_type: str  # e.g., "Mother", "Father", "Guardian"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# models.py (Part 4)

class StudentProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True) # Unique ensures 1 profile per user

    admission_number: str = Field(index=True, unique=True)
    class_name: str  # Kept as simple string for MVP!

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship to cleanly fetch connected parents via our link table
    parents: List["ParentProfile"] = Relationship(
        back_populates="students", 
        link_model=ParentStudentLink
    )


class ParentProfile(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="user.id", unique=True)

    phone_number: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationship to cleanly fetch connected students via our link table
    students: List["StudentProfile"] = Relationship(
        back_populates="parents", 
        link_model=ParentStudentLink
    )

    