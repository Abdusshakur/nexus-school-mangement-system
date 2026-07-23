# backend/app/routers/parents.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from uuid import UUID
from typing import List, Optional
from sqlmodel import or_, func


from backend.app.db.database import get_session
from backend.app.models import User, UserRole, ParentProfile, StudentProfile, ParentStudentLink
from backend.app.schemas.parent import (
    ParentCreateRequest, 
    ParentProfileUpdate, 
    ParentResponse,
    ParentDetailResponse, LinkedStudentResponse
)
from backend.app.core.auth_utils import RoleChecker, hash_password

router = APIRouter(
    prefix="/parents",
    tags=["Parent Management"]
)

# Only admins and teachers can manage parent records directly
allow_staff_only = RoleChecker(["admin", "teacher"])

def fetch_linked_children_for_parent(parent_id: UUID, session: Session) -> List[LinkedStudentResponse]:
    """Fetch all linked student profiles for a parent."""
    student_query = (
        select(StudentProfile, ParentStudentLink.relationship_type)
        .join(ParentStudentLink, ParentStudentLink.student_id == StudentProfile.id)
        .where(ParentStudentLink.parent_id == parent_id)
    )
    student_results = session.exec(student_query).all()
    return [
        LinkedStudentResponse(
            id=student_profile.id,
            first_name=student_profile.first_name,
            last_name=student_profile.last_name,
            admission_number=student_profile.admission_number,
            class_name=student_profile.class_name,
            relationship_type=str(rel_type.value) if hasattr(rel_type, 'value') else str(rel_type)
        )
        for student_profile, rel_type in student_results
    ]


# Helper function to map to response schema
def build_parent_response(profile: ParentProfile, email: str, session: Optional[Session] = None) -> ParentResponse:
    children = fetch_linked_children_for_parent(profile.id, session) if session else []
    return ParentResponse(
        id=profile.id,
        user_id=profile.user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        email=email,
        phone_number=profile.phone_number,
        created_at=profile.created_at,
        students=children,
        children=children
    )

# ------------------------------------------------------------------
# POST: Create Standalone Parent
# ------------------------------------------------------------------
@router.post(
    "/", 
    response_model=ParentResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_staff_only)]
)
def create_parent(
    payload: ParentCreateRequest, 
    session: Session = Depends(get_session)
):
    """Admin creates a parent account manually without attaching a student yet."""
    
    # 1. Check if email already exists
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A user account with this email address already exists."
        )

    # 2. Create User account
    temp_password = "WelcomeNexus2026!"
    new_user = User(
        email=str(payload.email),
        password_hash=hash_password(temp_password),
        role=UserRole.PARENT
    )
    session.add(new_user)
    session.flush()

    # 3. Create Parent Profile
    new_profile = ParentProfile(
        user_id=new_user.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    return build_parent_response(new_profile, new_user.email, session)


# ------------------------------------------------------------------
# PATCH: Update Parent Details
# ------------------------------------------------------------------
@router.patch(
    "/{parent_id}", 
    response_model=ParentResponse,
    dependencies=[Depends(allow_staff_only)]
)
def update_parent_profile(
    parent_id: UUID, 
    payload: ParentProfileUpdate, 
    session: Session = Depends(get_session)
):
    """Update a parent's demographic details (name, phone number)."""
    
    # 1. Fetch Profile
    profile = session.get(ParentProfile, parent_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Parent profile not found."
        )

    # 2. Apply updates dynamically
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    # 3. Save
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # 4. Fetch associated user to get the email
    user = session.get(User, profile.user_id)
    
    return build_parent_response(profile, user.email, session)


# ------------------------------------------------------------------
# GET: Fetch Single Parent
# ------------------------------------------------------------------
@router.get(
    "/{parent_id}", 
    response_model=ParentDetailResponse,
    dependencies=[Depends(allow_staff_only)]
)
def get_parent(
    parent_id: UUID, 
    session: Session = Depends(get_session)
):
    """Fetch a single parent's details, including all linked students (children)."""
    
    # 1. Fetch Parent & Parent's Email
    query = (
        select(ParentProfile, User)
        .join(User, ParentProfile.user_id == User.id)
        .where(ParentProfile.id == parent_id)
    )
    result = session.exec(query).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Parent profile not found."
        )
        
    profile, user = result

    # 2. Fetch Linked Students
    linked_students = fetch_linked_children_for_parent(profile.id, session)

    # 3. Return using Detail schema
    return ParentDetailResponse(
        id=profile.id,
        user_id=profile.user_id,
        first_name=profile.first_name,
        last_name=profile.last_name,
        email=user.email,
        phone_number=profile.phone_number,
        created_at=profile.created_at,
        students=linked_students,
        children=linked_students
    )

# ------------------------------------------------------------------
# GET: List All Parents (With Smart Search)
# ------------------------------------------------------------------
@router.get(
    "/", 
    response_model=List[ParentResponse],
    dependencies=[Depends(allow_staff_only)]
)
def list_parents(
    search: Optional[str] = Query(None, description="Search by email, first name, last name, phone, or full name"),
    session: Session = Depends(get_session)
):
    """Fetch a list of all parents in the system, with an optional smart search."""
    
    query = select(ParentProfile, User).join(User, ParentProfile.user_id == User.id)
    
    if search:
        search_term = f"%{search}%"
        
        # Stitch first and last name together in memory for full name matching
        full_name_concat = func.concat(ParentProfile.first_name, ' ', ParentProfile.last_name)
        
        query = query.where(
            or_(
                ParentProfile.first_name.ilike(search_term),
                ParentProfile.last_name.ilike(search_term),
                full_name_concat.ilike(search_term),
                User.email.ilike(search_term),
                ParentProfile.phone_number.ilike(search_term)
            )
        )
        
    # Order by newest first
    query = query.order_by(ParentProfile.created_at.desc())
    
    results = session.exec(query).all()
    
    return [build_parent_response(profile, user.email, session) for profile, user in results]