from pydantic import BaseModel, EmailStr
from uuid import UUID
from typing import List, Optional
from datetime import datetime

# ==================================================================
# 1. SHARED NESTED ITEMS (Used across responses)
# ==================================================================

class AssignedClassItem(BaseModel):
    id: UUID
    name: str

class AssignedSubjectItem(BaseModel):
    id: UUID
    name: str

# ==================================================================
# 2. STEP 1: TEACHER ONBOARDING (Profile Creation Only)
# ==================================================================

class TeacherCreateRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    gender: str                  # e.g., "MALE", "FEMALE"
    address: str
    department: str              # e.g., "Sciences", "Humanities"
    qualification: str           # e.g., "B.Ed Mathematics"

class TeacherCreateResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    gender: str
    department: str
    qualification: str
    address: str
    created_at: datetime


# ==================================================================
# 3. DEMOGRAPHIC PROFILE UPDATES (PATCH /teachers/{id})
# ==================================================================

class TeacherProfileUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    department: Optional[str] = None
    qualification: Optional[str] = None

class TeacherProfileUpdateResponse(BaseModel):
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    phone_number: str
    gender: str
    department: str
    qualification: str
    address: str
    updated_at: Optional[datetime] = None


# ==================================================================
# 4. CLASS ASSIGNMENTS (PUT /teachers/{id}/classes)
# ==================================================================

class AssignClassesRequest(BaseModel):
    class_ids: List[UUID]

class AssignClassesResponse(BaseModel):
    teacher_id: UUID
    assigned_classes: List[AssignedClassItem]


# ==================================================================
# 5. SUBJECT ASSIGNMENTS (PUT /teachers/{id}/subjects)
# ==================================================================

class AssignSubjectsRequest(BaseModel):
    subject_ids: List[UUID]

class AssignSubjectsResponse(BaseModel):
    teacher_id: UUID
    assigned_subjects: List[AssignedSubjectItem]

class AssignmentPair(BaseModel):
    class_id: UUID
    subject_id: UUID

class BulkTeacherAssignmentRequest(BaseModel):
    assignments: List[AssignmentPair]
# ==================================================================
# 6. FULL TEACHER DETAILS (GET /teachers/{id} or List Endpoints)
# ==================================================================

class TeacherDetailResponse(BaseModel):
    """Used when fetching a single teacher or list of teachers with all data joined."""
    id: UUID
    user_id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    gender: str
    department: str
    qualification: str
    address: str
    assigned_classes: List[AssignedClassItem] = []
    assigned_subjects: List[AssignedSubjectItem] = []
    created_at: datetime