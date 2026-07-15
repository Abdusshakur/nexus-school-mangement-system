# backend/app/routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from datetime import datetime
from typing import List, Optional
from backend.app.db.database import get_session
from backend.app.models import User, UserRole, StudentProfile, ParentProfile, ParentStudentLink
from backend.app.schemas.student import UnifiedStudentOnboardingCreate, StudentResponse
from backend.app.core.auth_utils import RoleChecker, hash_password

router = APIRouter(
    prefix="/students",
    tags=["Student Management"]
)

allow_staff_only = RoleChecker(["admin", "teacher"])

def generate_next_admission_number(session: Session) -> str:
    """Safely calculates the next sequential admission number for the current year."""
    current_year = datetime.now().year
    prefix = f"NEX-{current_year}-"
    
    # Query database for the highest sequence number matching this year's prefix
    # Postgres "FOR UPDATE" locks the rows to prevent simultaneous duplicate generation
    statement = (
        select(StudentProfile.admission_number)
        .where(StudentProfile.admission_number.like(f"{prefix}%"))
        .order_by(StudentProfile.admission_number.desc())
        .limit(1)
        .with_for_update() # 🔒 Atomic lock!
    )
    result = session.exec(statement).first()
    
    if not result:
        # First student of the year!
        return f"{prefix}0001"
    
    # Extract the numerical suffix (e.g., "0001" -> 1)
    try:
        last_sequence_str = result.replace(prefix, "")
        next_sequence = int(last_sequence_str) + 1
    except ValueError:
        next_sequence = 1
        
    # Format back to padded string (e.g., NEX-2026-0002)
    return f"{prefix}{next_sequence:04d}"


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=StudentResponse, dependencies=[Depends(allow_staff_only)])
def create_student_with_parent_onboarding(
    request: UnifiedStudentOnboardingCreate, 
    session: Session = Depends(get_session)
):
    """Transactionally onboarding a student, auto-assigning admission numbers, and processing parents."""
    
    # 1. Ensure student email is unique
    existing_student_user = session.query(User).filter(User.email == request.email).first()
    if existing_student_user:
        raise HTTPException(status_code=400, detail="Student email is already registered")

    try:
        # 2. Safely generate a unique, locked sequential admission number
        generated_admission_num = generate_next_admission_number(session)

        # 3. Create Student User Account
        student_user = User(
            email=request.email,
            password_hash=hash_password(request.password),
            role=UserRole.STUDENT
        )
        session.add(student_user)
        session.flush() # Yields student_user.id UUID

        # 4. Create Student Profile details
        student_profile = StudentProfile(
            user_id=student_user.id,
            admission_number=generated_admission_num, # Backend generated!
            first_name=request.first_name,
            last_name=request.last_name,
            gender=request.gender,
            address=request.address,
            phone_number=request.phone_number,
            class_name=request.class_name
        )
        session.add(student_profile)
        session.flush() # Yields student_profile.id UUID

        # 5. Handle Parent Onboarding (Find or Create)
        parent_user = session.query(User).filter(User.email == request.parent.email).first()
        
        if not parent_user:
            # New parent! Set up credentials & profile
            parent_user = User(
                email=request.parent.email,
                password_hash=hash_password("WelcomeNexus2026!"), # System default password
                role=UserRole.PARENT
            )
            session.add(parent_user)
            session.flush()

            parent_profile = ParentProfile(
                user_id=parent_user.id,
                first_name=request.parent.first_name,
                last_name=request.parent.last_name,
                phone_number=request.parent.phone_number
            )
            session.add(parent_profile)
            session.flush()
        else:
            # Parent exists. Let's pull their profile ID
            parent_profile = session.query(ParentProfile).filter(ParentProfile.user_id == parent_user.id).first()
            if not parent_profile:
                raise HTTPException(status_code=404, detail="Parent credentials found, but profile is missing.")

        # 6. Map the Relationship Link instantly
        relationship = ParentStudentLink(
            parent_id=parent_profile.id,
            student_id=student_profile.id,
            relationship_type="GUARDIAN"
        )
        session.add(relationship)

        # Commit everything to PostgreSQL atomically!
        session.commit()
        session.refresh(student_profile)

    except Exception as err:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Unified Onboarding Failed: {str(err)}"
        )

    # Return clean payload mapped cleanly to StudentResponse schema
    return StudentResponse(
        id=student_profile.id,
        user_id=student_user.id,
        email=student_user.email,
        admission_number=student_profile.admission_number,
        class_name=student_profile.class_name,
        created_at=student_profile.created_at
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