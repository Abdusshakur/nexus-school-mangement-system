# backend/app/routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session
from typing import List, Optional
from backend.app.db.database import get_session
from backend.app.models import User, StudentProfile, UserRole
from backend.app.schemas.student import StudentCreate, StudentResponse
from backend.app.core.auth_utils import RoleChecker, hash_password

router = APIRouter(
    prefix="/students",
    tags=["Student Management"]
)

# Enforce RBAC: Only Admin and Teacher can access student management
allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=StudentResponse, dependencies=[Depends(allow_staff_only)])
def create_student(request: StudentCreate, session: Session = Depends(get_session)):
    """Creates a student user account and their associated student profile."""
    # 1. Check if email already exists
    existing_user = session.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 2. Check if admission number is unique
    existing_student = session.query(StudentProfile).filter(StudentProfile.admission_number == request.admission_number).first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Admission number must be unique")

    # 3. Create the User account
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role=UserRole.STUDENT
    )
    session.add(new_user)
    session.flush() # Grab the new_user.id UUID

    # 4. Create the Student Profile linked via foreign key
    new_profile = StudentProfile(
        user_id=new_user.id,
        admission_number=request.admission_number,
        class_name=request.class_name
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    return StudentResponse(
        id=new_profile.id,
        user_id=new_user.id,
        email=new_user.email,
        admission_number=new_profile.admission_number,
        class_name=new_profile.class_name,
        created_at=new_profile.created_at
    )

@router.get("/", response_model=List[StudentResponse], dependencies=[Depends(allow_staff_only)])
def list_students(
    search: Optional[str] = Query(None, description="Search by admission number"),
    class_name: Optional[str] = Query(None, alias="class", description="Filter by class name"),
    session: Session = Depends(get_session)
):
    """Lists student profiles with optional query filters for class and search."""
    # We join the StudentProfile table with the User table to retrieve emails efficiently
    query = session.query(StudentProfile, User).join(User, StudentProfile.user_id == User.id)

    if class_name:
        query = query.filter(StudentProfile.class_name == class_name)
    if search:
        query = query.filter(StudentProfile.admission_number.contains(search))

    results = query.all()

    # Convert our database join results into our clean response model structure
    return [
        StudentResponse(
            id=profile.id,
            user_id=user.id,
            email=user.email,
            admission_number=profile.admission_number,
            class_name=profile.class_name,
            created_at=profile.created_at
        )
        for profile, user in results
    ]