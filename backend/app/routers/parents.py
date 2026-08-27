# backend/app/routers/parents.py

# backend/app/routers/parents.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, or_, func
from uuid import UUID
from typing import List, Optional

from backend.app.db.database import get_session
# 👇 1. Import V2 Gatekeeper Auth & Models
from backend.app.core.auth_utils import CurrentContext, require_permission, hash_password
from backend.app.models import (
    User, Role, UserSchoolLink, ParentProfile, StudentProfile, ParentStudentLink,
    AcademicSession, AcademicTerm, StudentEnrollment, SchoolClass, EnrollmentStatus
)
from backend.app.schemas.parent import (
    ParentCreateRequest, ParentProfileUpdate, ParentResponse,
    ParentDetailResponse, LinkedStudentResponse
)

router = APIRouter(
    prefix="/parents",
    tags=["Parent Management"]
)

# ❌ Old allow_staff_only = RoleChecker(["admin", "teacher"]) deleted

def fetch_linked_children_for_parent(
    parent_id: UUID, 
    school_id: UUID, # 👈 Requires tenant context
    session: Session
) -> List[LinkedStudentResponse]:
    """Fetch all linked student profiles for a parent, isolated to tenant and dynamically resolving class."""
    
    # 1. Resolve Temporal Anchors (Find "Now")
    current_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.school_id == school_id, AcademicSession.is_current == True
        )
    ).first()
    current_term = None
    if current_session:
        current_term = session.exec(
            select(AcademicTerm).where(
                AcademicTerm.school_id == school_id,
                AcademicTerm.session_id == current_session.id,
                AcademicTerm.is_current == True,
            )
        ).first()

    # 2. SECURE FETCH: Get base student profiles scoped to the tenant
    student_query = (
        select(StudentProfile, ParentStudentLink.relationship_type)
        .join(ParentStudentLink, ParentStudentLink.student_id == StudentProfile.id)
        .join(ParentProfile, ParentStudentLink.parent_id == ParentProfile.id)
        .where(
            ParentStudentLink.parent_id == parent_id,
            ParentProfile.school_id == school_id,
            StudentProfile.school_id == school_id # 👈 Tenant Isolation
        )
    )
    student_results = session.exec(student_query).all()
    
    linked_children = []
    for student_profile, rel_type in student_results:
        current_class_name = "Unassigned"
        
        # 3. 🛡️ CONTEXTUAL ENROLLMENT RESOLUTION (The V2 Fix)
        if current_session and current_term:
            enrollment_query = (
                select(SchoolClass.name)
                .join(StudentEnrollment, StudentEnrollment.class_id == SchoolClass.id)
                .where(
                    StudentEnrollment.student_id == student_profile.id,
                    StudentEnrollment.school_id == school_id,
                    StudentEnrollment.session_id == current_session.id,
                    StudentEnrollment.term_id == current_term.id,
                    StudentEnrollment.status == EnrollmentStatus.ACTIVE,
                    SchoolClass.school_id == school_id,
                )
            )
            current_class_name = session.exec(enrollment_query).first() or "Unassigned"

        linked_children.append(
            LinkedStudentResponse(
                id=student_profile.id,
                first_name=student_profile.first_name,
                last_name=student_profile.last_name,
                admission_number=student_profile.admission_number,
                class_name=current_class_name, # 👈 Dynamically injected!
                relationship_type=str(rel_type.value) if hasattr(rel_type, 'value') else str(rel_type)
            )
        )
        
    return linked_children


# Helper function to map to response schema
def build_parent_response(
    profile: ParentProfile, 
    email: str, 
    school_id: UUID, # 👈 Requires tenant context
    session: Session
) -> ParentResponse:
    children = fetch_linked_children_for_parent(profile.id, school_id, session)
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
    status_code=status.HTTP_201_CREATED
)
def create_parent(
    payload: ParentCreateRequest, 
    context: CurrentContext = Depends(require_permission("parent:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Admin creates a parent account manually without attaching a student yet, scoped to the tenant."""
    
    # 1. Check if email already exists globally
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="A user account with this email address already exists on the platform."
        )

    # 2. Fetch the Parent role dynamically from the database
    parent_role = session.exec(select(Role).where(Role.name.ilike("parent"))).first()
    if not parent_role:
        raise HTTPException(status_code=500, detail="System configuration error: 'parent' role missing.")

    # 3. Create User account locked to Tenant
    temp_password = "WelcomeNexus2026!"
    new_user = User(
        email=str(payload.email),
        password_hash=hash_password(temp_password),
        role_id=parent_role.id,
        school_id=context.school_id # 👈 Tenant Isolation
    )
    session.add(new_user)
    session.flush()

    session.add(
        UserSchoolLink(
            user_id=new_user.id,
            school_id=context.school_id,
            role_id=parent_role.id,
        )
    )

    # 4. Create Parent Profile locked to Tenant
    new_profile = ParentProfile(
        user_id=new_user.id,
        school_id=context.school_id, # 👈 Tenant Isolation
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    # 5. Pass the school_id context to our upgraded helper function
    return build_parent_response(new_profile, new_user.email, context.school_id, session)

# ------------------------------------------------------------------
# PATCH: Update Parent Details
# ------------------------------------------------------------------
@router.patch(
    "/{parent_id}", 
    response_model=ParentResponse
)
def update_parent_profile(
    parent_id: UUID, 
    payload: ParentProfileUpdate, 
    context: CurrentContext = Depends(require_permission("parent:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Update a parent's demographic details, strictly scoped to the tenant."""
    
    # 1. SECURE FETCH: Ensure the parent profile belongs to this exact school
    profile = session.exec(
        select(ParentProfile).where(
            ParentProfile.id == parent_id,
            ParentProfile.school_id == context.school_id # 👈 Tenant Isolation
        )
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Parent profile not found in your school."
        )

    # 2. Apply updates dynamically for fields provided
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)

    # 3. Save changes
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # 4. Fetch associated user to get the email
    user = session.exec(
        select(User).where(
            User.id == profile.user_id,
            User.school_id == context.school_id,
        )
    ).first()
    if not user:
        raise HTTPException(status_code=404, detail="Parent user account not found in your school.")
    
    # 5. Pass the school_id context to our upgraded helper function
    return build_parent_response(profile, user.email, context.school_id, session)


# ------------------------------------------------------------------
# GET: Fetch Single Parent
# ------------------------------------------------------------------
@router.get(
    "/{parent_id}", 
    response_model=ParentDetailResponse
)
def get_parent(
    parent_id: UUID, 
    context: CurrentContext = Depends(require_permission("parent:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetch a single parent's details, including all linked students (children), isolated to the tenant."""
    
    # 1. SECURE FETCH: Join Profile and User, strictly locked to the school_id
    query = (
        select(ParentProfile, User)
        .join(User, ParentProfile.user_id == User.id)
        .where(
            ParentProfile.id == parent_id,
            ParentProfile.school_id == context.school_id # 👈 Tenant Isolation
        )
    )
    query = query.where(User.school_id == context.school_id)
    result = session.exec(query).first()
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Parent profile not found in your school."
        )
        
    profile, user = result

    # 2. Fetch Linked Students (Passing the Tenant context to the helper!)
    linked_students = fetch_linked_children_for_parent(profile.id, context.school_id, session)

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
    response_model=List[ParentResponse]
)
def list_parents(
    search: Optional[str] = Query(None, description="Search by email, first name, last name, phone, or full name"),
    context: CurrentContext = Depends(require_permission("parent:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetch a list of all parents in the system, with an optional smart search, scoped strictly to the tenant."""
    
    # 1. SECURE FETCH: Join Profile and User, and lock to the school_id
    query = (
        select(ParentProfile, User)
        .join(User, ParentProfile.user_id == User.id)
        .where(ParentProfile.school_id == context.school_id) # 👈 Tenant Isolation Boundary
    )
    
    query = query.where(User.school_id == context.school_id)

    # 2. Apply Smart Search (Only searches within the tenant)
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
    
    # 3. Pass the school_id context into our upgraded helper function
    return [
        build_parent_response(profile, user.email, context.school_id, session) 
        for profile, user in results
    ]
