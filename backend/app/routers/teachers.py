from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from sqlmodel import select, or_, func, String


from backend.app.db.database import get_session
# 👇 1. Import V2 Gatekeeper Auth
from backend.app.core.auth_utils import CurrentContext, require_permission, hash_password

from backend.app.models import (
    User, Role, TeacherProfile, SchoolClass, Subject, 
    TeacherAssignment, AssignmentStatus, AcademicSession, AcademicTerm
)
from backend.app.schemas.teacher import (
    TeacherCreateRequest, TeacherCreateResponse,
    TeacherProfileUpdateRequest, TeacherProfileUpdateResponse,
    AssignClassesRequest, AssignClassesResponse,
    AssignSubjectsRequest, AssignSubjectsResponse,
    TeacherDetailResponse, AssignedClassItem, AssignedSubjectItem, BulkTeacherAssignmentRequest
)

router = APIRouter(prefix="/teachers", tags=["Teacher Management"])


# Helper function for aggregating full details dynamically (e.g. GET /teachers/{id})
def build_teacher_detail_response(
    teacher: TeacherProfile, 
    email: str, 
    school_id: UUID, 
    session: Session,
    academic_session_id: Optional[UUID] = None,
    academic_term_id: Optional[UUID] = None
) -> TeacherDetailResponse:
    
    assigned_classes_list = []
    assigned_subjects_list = []

    # Only fetch assignments if we know the temporal context (Year & Term)
    if academic_session_id and academic_term_id:
        assignments_query = (
            select(SchoolClass, Subject)
            .join(TeacherAssignment, TeacherAssignment.class_id == SchoolClass.id)
            .join(Subject, TeacherAssignment.subject_id == Subject.id)
            .where(
                TeacherAssignment.teacher_id == teacher.id,
                TeacherAssignment.school_id == school_id, # 👈 Tenant Isolation
                TeacherAssignment.session_id == academic_session_id,
                TeacherAssignment.term_id == academic_term_id,
                TeacherAssignment.status == AssignmentStatus.ACTIVE
            )
        )
        
        results = session.exec(assignments_query).all()
        
        # A teacher might teach 3 subjects in JSS 1, so we use sets to avoid duplicate UI entries
        unique_classes = {cls.id: cls for cls, sub in results}
        unique_subjects = {sub.id: sub for cls, sub in results}

        assigned_classes_list = [
            AssignedClassItem(id=cls.id, name=cls.name) for cls in unique_classes.values()
        ]
        assigned_subjects_list = [
            AssignedSubjectItem(id=sub.id, name=sub.name) for sub in unique_subjects.values()
        ]
    
    return TeacherDetailResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=email,
        phone_number=teacher.phone_number,
        gender=teacher.gender,
        department=teacher.department,
        qualification=teacher.qualification,
        address=teacher.address,
        assigned_classes=assigned_classes_list,
        assigned_subjects=assigned_subjects_list,
        created_at=teacher.created_at
    )


# ------------------------------------------------------------------
# STEP 1: Create Base Teacher Profile
# ------------------------------------------------------------------

@router.post(
    "/", 
    response_model=TeacherCreateResponse, 
    status_code=status.HTTP_201_CREATED
)
def create_teacher(
    payload: TeacherCreateRequest, 
    context: CurrentContext = Depends(require_permission("teacher:write")), # 👈 1. Gatekeeper Authorization
    session: Session = Depends(get_session)
):
    """
    Step 1: Onboard a teacher profile and create their User account, strictly isolated to the tenant.
    Returns only profile data without requiring class or subject schedules.
    """
    # 2. Ensure email uniqueness globally
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email address already exists."
        )

    # 3. Fetch the V2 Role dynamically from the database
    teacher_role = session.exec(select(Role).where(Role.name.ilike("teacher"))).first()
    if not teacher_role:
        raise HTTPException(status_code=500, detail="System configuration error: 'teacher' role missing.")

    temp_password = "Teacher@Nexus2026"  
    
    # 4. Create User Account scoped to the Tenant
    new_user = User(
        email=payload.email,
        password_hash=hash_password(temp_password),
        role_id=teacher_role.id,
        school_id=context.school_id, # 👈 Tenant Isolation
        is_active=True
    )
    session.add(new_user)
    session.flush()

    # 5. Create Teacher Profile scoped to the Tenant
    teacher_profile = TeacherProfile(
        user_id=new_user.id,
        school_id=context.school_id, # 👈 Tenant Isolation
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        gender=payload.gender,
        address=payload.address,
        department=payload.department,
        qualification=payload.qualification
    )
    session.add(teacher_profile)
    session.commit()
    session.refresh(teacher_profile)

    return TeacherCreateResponse(
        id=teacher_profile.id,
        user_id=new_user.id,
        first_name=teacher_profile.first_name,
        last_name=teacher_profile.last_name,
        email=new_user.email,
        phone_number=teacher_profile.phone_number,
        gender=teacher_profile.gender,
        department=teacher_profile.department,
        qualification=teacher_profile.qualification,
        address=teacher_profile.address,
        created_at=teacher_profile.created_at
    )


# ------------------------------------------------------------------
# STEP 2: Unified Contextual Assignments (Replaces 2A & 2B)
# ------------------------------------------------------------------

@router.put(
    "/{teacher_id}/assignments", 
    response_model=TeacherDetailResponse,
)
def update_teacher_assignments(
    teacher_id: UUID, 
    payload: BulkTeacherAssignmentRequest, # 👈 New Unified Schema
    context: CurrentContext = Depends(require_permission("teacher:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """
    Step 2: Sync contextual teacher assignments (Subject + Class pairs).
    Updates assignments only for the current active Academic Term, preserving history.
    """
    # 1. SECURE FETCH: Ensure teacher belongs to this school
    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.id == teacher_id,
            TeacherProfile.school_id == context.school_id
        )
    ).first()
    
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found in your school.")

    # 2. Resolve Temporal Anchors (Must assign within a specific Term)
    current_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.school_id == context.school_id, AcademicSession.is_current == True
        )
    ).first()
    current_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.school_id == context.school_id, AcademicTerm.is_current == True
        )
    ).first()

    if not current_session or not current_term:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Cannot assign roles: No active Academic Session and Term configured."
        )

    # 3. Retire existing assignments for THIS specific term only
    existing_assignments = session.exec(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher_id,
            TeacherAssignment.session_id == current_session.id,
            TeacherAssignment.term_id == current_term.id
        )
    ).all()
    
    for old_assignment in existing_assignments:
        # Instead of deleting, we safely mark them inactive to preserve audit logs
        old_assignment.status = AssignmentStatus.INACTIVE
        session.add(old_assignment)
    
    session.flush()

    # 4. Validate & Create the new Contextual Assignments
    for assignment_pair in payload.assignments:
        # Verify Class belongs to school
        target_class = session.exec(
            select(SchoolClass).where(SchoolClass.id == assignment_pair.class_id, SchoolClass.school_id == context.school_id)
        ).first()
        # Verify Subject belongs to school
        target_subject = session.exec(
            select(Subject).where(Subject.id == assignment_pair.subject_id, Subject.school_id == context.school_id)
        ).first()

        if not target_class or not target_subject:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Class or Subject ID provided does not exist in your school."
            )

        # Create the time-locked V2 Contract
        new_assignment = TeacherAssignment(
            school_id=context.school_id,
            teacher_id=teacher_id,
            session_id=current_session.id,
            term_id=current_term.id,
            class_id=target_class.id,
            subject_id=target_subject.id,
            status=AssignmentStatus.ACTIVE
        )
        session.add(new_assignment)

    session.commit()
    
    # 5. Return the full updated profile using the V2 helper function we built earlier!
    user = session.get(User, teacher.user_id)
    return build_teacher_detail_response(
        teacher, user.email, context.school_id, session, current_session.id, current_term.id
    )


# ------------------------------------------------------------------
# Demographic Profile Updates (PATCH /teachers/{id})
# ------------------------------------------------------------------

@router.patch(
    "/{teacher_id}", 
    response_model=TeacherProfileUpdateResponse
)
def update_teacher_profile(
    teacher_id: UUID, 
    payload: TeacherProfileUpdateRequest,
    context: CurrentContext = Depends(require_permission("teacher:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Update demographic and professional details securely locked to the tenant."""
    
    # 1. SECURE FETCH: Ensure the teacher actually belongs to this school
    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.id == teacher_id,
            TeacherProfile.school_id == context.school_id  # 👈 Multi-Tenant Boundary
        )
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found in your school."
        )

    # 2. Apply updates only for provided fields
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(teacher, key, value)

    # 3. Save changes
    session.add(teacher)
    session.commit()
    session.refresh(teacher)

    return TeacherProfileUpdateResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        phone_number=teacher.phone_number,
        gender=teacher.gender,
        department=teacher.department,
        qualification=teacher.qualification,
        address=teacher.address
    )


# ------------------------------------------------------------------
# GET Full Teacher Details (Demographics + Contextual Schedules)
# ------------------------------------------------------------------

@router.get(
    "/{teacher_id}", 
    response_model=TeacherDetailResponse
)
def get_teacher_detail(
    teacher_id: UUID, 
    context: CurrentContext = Depends(require_permission("teacher:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetch complete teacher profile including currently assigned classes and subjects, locked to tenant."""
    
    # 1. SECURE FETCH: Ensure the teacher belongs to this school
    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.id == teacher_id,
            TeacherProfile.school_id == context.school_id
        )
    ).first()
    
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found in your school."
        )

    # Fetch User to get the email address
    user = session.get(User, teacher.user_id)

    # 2. Resolve Temporal Anchors (Find out what "now" is)
    current_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.school_id == context.school_id, AcademicSession.is_current == True
        )
    ).first()
    current_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.school_id == context.school_id, AcademicTerm.is_current == True
        )
    ).first()

    academic_session_id = current_session.id if current_session else None
    academic_term_id = current_term.id if current_term else None

    # 3. Call our upgraded V2 helper function!
    # It will automatically query the TeacherAssignment table for this specific time period.
    return build_teacher_detail_response(
        teacher=teacher, 
        email=user.email,
        school_id=context.school_id,
        session=session,
        academic_session_id=academic_session_id,
        academic_term_id=academic_term_id
    )


# ------------------------------------------------------------------
# GET: List All Teachers
# ------------------------------------------------------------------
@router.get("/", response_model=List[TeacherCreateResponse])
def list_teachers(
    search: Optional[str] = Query(None, description="Search by Department or ID"),
    name: Optional[str] = Query(None, description="Search by first name, last name, or full name"), 
    context: CurrentContext = Depends(require_permission("teacher:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Lists teacher profiles with optional query filters, strictly isolated to the tenant."""
    
    # 1. SECURE BASE QUERY: Join Profile and User, locked to the school_id
    query = (
        select(TeacherProfile, User)
        .join(User, TeacherProfile.user_id == User.id)
        .where(TeacherProfile.school_id == context.school_id) # 👈 Tenant Isolation
    )
        
    # 2. Department or ID filter
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                TeacherProfile.department.ilike(search_term),
                # Cast the UUID to a string so we can safely search it
                func.cast(TeacherProfile.id, String).ilike(search_term)
            )
        )
        
    # 3. 🧠 Smart Name filter (Checks First, Last, and Combined Full Name)
    if name:
        search_term = f"%{name}%"
        full_name_concat = func.concat(TeacherProfile.first_name, ' ', TeacherProfile.last_name)
        
        query = query.where(
            or_(
                TeacherProfile.first_name.ilike(search_term),
                TeacherProfile.last_name.ilike(search_term),
                full_name_concat.ilike(search_term)
            )
        )
    
    # Order by newest first
    query = query.order_by(TeacherProfile.created_at.desc())
    
    # Execute using SQLModel's session.exec()
    results = session.exec(query).all()

    return [
        TeacherCreateResponse(
            id=profile.id,
            user_id=user.id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            email=user.email,
            phone_number=profile.phone_number,
            gender=profile.gender,
            department=profile.department,
            qualification=profile.qualification,
            address=profile.address,
            created_at=profile.created_at
        )
        for profile, user in results
    ]
