# backend/app/routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func, or_
from datetime import datetime, date
from typing import List, Optional
from uuid import UUID
from backend.app.db.database import get_session
from backend.app.models import User, UserRole, StudentProfile, ParentProfile, ParentStudentLink
from backend.app.schemas.student import (UnifiedStudentOnboardingCreate, StudentResponse, StudentProfileUpdate, 
                                        LinkedParentResponse, StudentDetailResponse)
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


@router.post(
    "/", 
    status_code=status.HTTP_201_CREATED, 
    response_model=StudentResponse, 
    dependencies=[Depends(allow_staff_only)]
)
def create_student_with_parent_onboarding(
    request: UnifiedStudentOnboardingCreate, 
    session: Session = Depends(get_session)
):
    """Transactionally onboard a student, auto-assign admission numbers, and process 1 or 2 parents."""
    
    # 1. Ensure student email is unique
    existing_student_user = session.exec(select(User).where(User.email == request.email)).first()
    if existing_student_user:
        raise HTTPException(status_code=400, detail="Student email is already registered")

    try:
        # 2. Safely generate admission number
        generated_admission_num = generate_next_admission_number(session)

        # 3. Create Student User Account
        student_user = User(
            email=str(request.email),
            password_hash=hash_password(request.password),
            role=UserRole.STUDENT
        )
        session.add(student_user)
        session.flush()

        # 4. Create Student Profile details
        student_profile = StudentProfile(
            user_id=student_user.id,
            admission_number=generated_admission_num,
            first_name=request.first_name,
            last_name=request.last_name,
            gender=request.gender,
            address=request.address,
            phone_number=request.phone_number,
            date_of_birth=request.date_of_birth,
            class_name=request.class_name
        )
        session.add(student_profile)
        session.flush() 

        # 5. Handle Parents Array (Find or Create)
        for parent_data in request.parents:
            parent_user = session.exec(select(User).where(User.email == parent_data.email)).first()
            
            if not parent_user:
                # New parent! Set up credentials & profile
                parent_user = User(
                    email=str(parent_data.email),
                    password_hash=hash_password("WelcomeNexus2026!"), 
                    role=UserRole.PARENT
                )
                session.add(parent_user)
                session.flush()

                parent_profile = ParentProfile(
                    user_id=parent_user.id,
                    first_name=parent_data.first_name,
                    last_name=parent_data.last_name,
                    phone_number=parent_data.phone_number
                )
                session.add(parent_profile)
                session.flush()
            else:
                # Parent exists. Pull their profile ID (Sibling scenario!)
                parent_profile = session.exec(select(ParentProfile).where(ParentProfile.user_id == parent_user.id)).first()
                if not parent_profile:
                    raise HTTPException(
                        status_code=500, 
                        detail=f"Parent credentials found for {parent_data.email}, but profile is corrupted."
                    )

            # 6. Map the Relationship Link with the new DB columns!
            relationship = ParentStudentLink(
                parent_id=parent_profile.id,
                student_id=student_profile.id,
                relationship_type=parent_data.relationship_type,
                is_primary_contact=parent_data.is_primary_contact,
                is_financial_sponsor=parent_data.is_financial_sponsor
            )
            session.add(relationship)

        # 7. Commit everything to PostgreSQL atomically!
        session.commit()
        session.refresh(student_profile)

    except Exception as err:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Unified Onboarding Failed: {str(err)}"
        )

    # 8. Return cleanly
    return StudentResponse(
        id=student_profile.id,
        user_id=student_user.id,
        first_name=student_profile.first_name,
        last_name=student_profile.last_name,
        email=student_user.email,
        admission_number=student_profile.admission_number,
        class_name=student_profile.class_name,
        gender=student_profile.gender,         
        date_of_birth=student_profile.date_of_birth,
        phone_number=student_profile.phone_number,
        address=student_profile.address,
        created_at=student_profile.created_at
    )



@router.get("/", response_model=List[StudentResponse], dependencies=[Depends(allow_staff_only)])
def list_students(
    search: Optional[str] = Query(None, description="Search by admission number"),
    class_name: Optional[str] = Query(None, alias="class", description="Filter by class name"),
    name: Optional[str] = Query(None, description="Search by first name, last name, or full name"), # 🔑 Unified param!
    session: Session = Depends(get_session)
):
    """Lists student profiles with optional query filters for class, admission number, or name."""
    query = session.query(StudentProfile, User).join(User, StudentProfile.user_id == User.id)

    # 1. Class filter (Exact match)
    if class_name:
        query = query.filter(StudentProfile.class_name == class_name)
        
    # 2. Admission Number filter (Partial match)
    if search:
        query = query.filter(StudentProfile.admission_number.ilike(f"%{search}%"))
        
    # 3. 🧠 Smart Name filter (Checks First, Last, and Combined Full Name)
    if name:
        search_term = f"%{name}%"
        
        # This tells the database to stitch the fields together in memory: "Firstname Lastname"
        full_name_concat = func.concat(StudentProfile.first_name, ' ', StudentProfile.last_name)
        
        query = query.filter(
            or_(
                StudentProfile.first_name.ilike(search_term),     # Matches "Jane"
                StudentProfile.last_name.ilike(search_term),      # Matches "Smith"
                full_name_concat.ilike(search_term)               # Matches "Jane Smith"
            )
        )
    
    results = query.all()

    return [
        StudentResponse(
            id=profile.id,
            user_id=user.id,
            email=user.email,
            admission_number=profile.admission_number,
            class_name=profile.class_name,
            first_name=profile.first_name,
            last_name=profile.last_name,
            gender=profile.gender,               
            date_of_birth=profile.date_of_birth,
            phone_number=profile.phone_number,
            address=profile.address,
            created_at=profile.created_at
        )
        for profile, user in results
    ]

# ------------------------------------------------------------------
# GET: View Single Student by Admission Number
# ------------------------------------------------------------------
@router.get(
    "/{admission_number}", 
    response_model=StudentResponse, 
    dependencies=[Depends(allow_staff_only)]
)
def get_student_by_admission_number(
    admission_number: str,
    session: Session = Depends(get_session)
):
    """Fetch a single student's complete profile using their unique admission number."""
    
    # Query both StudentProfile and User to get all details (including email)
    query = (
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.admission_number == admission_number)
    )
    result = session.exec(query).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with admission number '{admission_number}' not found."
        )
        
    profile, user = result
    
    return StudentResponse(
        id=profile.id,
        user_id=user.id,
        email=user.email,
        admission_number=profile.admission_number,
        class_name=profile.class_name,
        first_name=profile.first_name,
        last_name=profile.last_name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        phone_number=profile.phone_number,
        address=profile.address,
        created_at=profile.created_at
    )

@router.get(
    "/{admission_number}", 
    response_model=StudentDetailResponse, # 👈 Updated schema here
    dependencies=[Depends(allow_staff_only)]
)
def get_student_by_admission_number(
    admission_number: str,
    session: Session = Depends(get_session)
):
    """Fetch a single student's complete profile, including linked parents."""
    
    # 1. Fetch Student & Student's Email
    student_query = (
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.admission_number == admission_number)
    )
    student_result = session.exec(student_query).first()
    
    if not student_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with admission number '{admission_number}' not found."
        )
        
    profile, student_user = student_result
    
    # 2. Fetch Linked Parents & Parent's Email & Relationship Type
    parent_query = (
        select(ParentProfile, User.email, ParentStudentLink.relationship_type)
        .join(ParentStudentLink, ParentStudentLink.parent_id == ParentProfile.id)
        .join(User, User.id == ParentProfile.user_id)
        .where(ParentStudentLink.student_id == profile.id)
    )
    parent_results = session.exec(parent_query).all()
    
    # 3. Format the parents list
    linked_parents = []
    for parent_profile, parent_email, rel_type in parent_results:
        linked_parents.append(
            LinkedParentResponse(
                id=parent_profile.id,
                first_name=parent_profile.first_name,
                last_name=parent_profile.last_name,
                phone_number=parent_profile.phone_number,
                email=parent_email,
                relationship_type=rel_type
            )
        )
    
    # 4. Return using the Detail schema
    return StudentDetailResponse( 
        id=profile.id,
        user_id=student_user.id,
        email=student_user.email,
        admission_number=profile.admission_number,
        class_name=profile.class_name,
        first_name=profile.first_name,
        last_name=profile.last_name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        phone_number=profile.phone_number,
        address=profile.address,
        created_at=profile.created_at,
        parents=linked_parents
    )

# ------------------------------------------------------------------
# PATCH: Update Student Details
# ------------------------------------------------------------------
@router.patch(
    "/{student_id}", 
    response_model=StudentResponse, 
    dependencies=[Depends(allow_staff_only)]
)
def update_student_profile(
    student_id: UUID,
    payload: StudentProfileUpdate,
    session: Session = Depends(get_session)
):
    """Update specific fields of a student's profile."""
    
    # 1. Fetch the student profile
    profile = session.get(StudentProfile, student_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student profile not found."
        )
        
    # 2. Apply updates only for fields that were actually provided
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
        
    # 3. Save changes
    session.add(profile)
    session.commit()
    session.refresh(profile)
    
    # 4. Fetch the associated User to complete the StudentResponse payload
    user = session.get(User, profile.user_id)
    
    return StudentResponse(
        id=profile.id,
        user_id=user.id,
        email=user.email,
        admission_number=profile.admission_number,
        class_name=profile.class_name,
        first_name=profile.first_name,
        last_name=profile.last_name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        phone_number=profile.phone_number,
        address=profile.address,
        created_at=profile.created_at
    )