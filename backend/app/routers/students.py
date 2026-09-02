# backend/app/routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func, or_
from datetime import datetime, date
from typing import List, Optional
from uuid import UUID
from backend.app.db.database import get_session

# 👇 1. Import V2 Gatekeeper and updated Models
from backend.app.core.auth_utils import CurrentContext, require_permission, hash_password
from backend.app.models import (
    User, StudentProfile, ParentProfile, ParentStudentLink, 
    SchoolClass, AcademicSession, AcademicTerm, StudentEnrollment, SchoolSettings, EnrollmentStatus,
    Role, UserRole, School
)

from backend.app.services.parent_relationship_service import build_parent_student_link
from backend.app.schemas.student import (
    UnifiedStudentOnboardingCreate, StudentResponse, StudentProfileUpdate, 
    LinkedParentResponse, StudentDetailResponse, TransferStudentRequest, BulkTransferStudentRequest, StudentEnrollmentHistoryResponse
)



router = APIRouter(
    prefix="/students",
    tags=["Student Management"]
)

def fetch_linked_parents(student_id: UUID, school_id: UUID, session: Session) -> List[LinkedParentResponse]:
    """Helper function to fetch all parents attached to a specific student, isolated to the tenant."""
    query = (
        select(ParentProfile, User, ParentStudentLink.relationship_type)
        .join(ParentStudentLink, ParentStudentLink.parent_id == ParentProfile.id)
        .join(User, ParentProfile.user_id == User.id)
        .where(
            ParentStudentLink.student_id == student_id,
            ParentStudentLink.school_id == school_id,
            ParentProfile.school_id == school_id  # 👈 MULTI-TENANT ISOLATION
        )
    )
    results = session.exec(query).all()
    
    return [
        LinkedParentResponse(
            id=parent_profile.id,
            first_name=parent_profile.first_name,
            last_name=parent_profile.last_name,
            phone_number=parent_profile.phone_number,
            address=parent_profile.address,
            email=parent_user.email,
            relationship_type=relationship_type
        )
        for parent_profile, parent_user, relationship_type in results
    ]


def generate_next_admission_number(school_id: UUID, session: Session, academic_year: int) -> str:
    """Safely calculates the next sequential admission number using the tenant's SchoolSettings."""
    
    # 1. Fetch the school's settings with a row lock to prevent race conditions
    settings = session.exec(
        select(SchoolSettings)
        .where(SchoolSettings.school_id == school_id)
        .with_for_update() # 🔒 Atomic lock!
    ).first()
    
    # Auto-create default settings if the school is brand new and missing this row
    if not settings:
        settings = SchoolSettings(
            school_id=school_id, 
            admission_prefix="NEX", 
            current_admission_sequence=0
        )
        session.add(settings)
        session.flush() # Flush so we can use it immediately in this transaction
        
    # 2. Increment the true integer sequence
    settings.current_admission_sequence += 1
    session.add(settings)
    
    # 3. Format the new Admission Number (e.g., NEX-2026-0001)
    new_number = f"{settings.admission_prefix}-{academic_year}-{settings.current_admission_sequence:04d}"
    
    # Note: We do NOT commit here. The parent endpoint will commit everything together 
    # (the new student, the enrollment, and this incremented sequence) in one atomic transaction.
    return new_number


@router.post(
    "/", 
    status_code=status.HTTP_201_CREATED, 
    response_model=StudentResponse
)
def create_student_with_parent_onboarding(
    request: UnifiedStudentOnboardingCreate, 
    context: CurrentContext = Depends(require_permission("student:write")), # 👈 1. Gatekeeper Authorization
    session: Session = Depends(get_session)
):
    """Transactionally onboard a student, auto-assign isolated admission numbers, map contextual enrollment, and process parents."""
    
    # 1. Ensure student email is unique globally
    existing_student_user = session.exec(select(User).where(User.email == request.email)).first()
    if existing_student_user:
        raise HTTPException(status_code=400, detail="Student email is already registered")

    # 2. Resolve Temporal Anchors & Target Class
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
            status_code=400, detail="Active Academic Session and Term must be configured before admitting students."
        )

    # Note: request.class_name must be changed to request.class_id in your UnifiedStudentOnboardingCreate schema!
    target_class = session.exec(
        select(SchoolClass).where(SchoolClass.id == request.class_id, SchoolClass.school_id == context.school_id)
    ).first()

    if not target_class:
        raise HTTPException(status_code=404, detail="Target class not found in this school.")

    try:
        # 3. Roles and Admission Number
        academic_year = current_session.start_date.year
        generated_admission_num = generate_next_admission_number(context.school_id, session, academic_year)

        student_role = session.exec(select(Role).where(Role.name.ilike("student"))).first()
        parent_role = session.exec(select(Role).where(Role.name.ilike("parent"))).first()

        # 4. Create Student User & Profile (Isolated to Tenant)
        student_user = User(
            email=str(request.email),
            password_hash=hash_password(request.password),
            role_id=student_role.id,
            school_id=context.school_id
        )
        session.add(student_user)
        session.flush()

        student_profile = StudentProfile(
            user_id=student_user.id,
            school_id=context.school_id,
            admission_number=generated_admission_num,
            first_name=request.first_name,
            last_name=request.last_name,
            gender=request.gender,
            address=request.address,
            phone_number=request.phone_number,
            date_of_birth=request.date_of_birth
            # ❌ class_name is permanently removed here!
        )
        session.add(student_profile)
        session.flush() 

        # 5. Create the Contextual Enrollment Engine
        new_enrollment = StudentEnrollment(
            school_id=context.school_id,
            student_id=student_profile.id,
            session_id=current_session.id,
            term_id=current_term.id,
            class_id=target_class.id,
            status=EnrollmentStatus.ACTIVE
        )
        session.add(new_enrollment)

        # 6. Handle Parents Array (Find or Create in Multi-Tenant space)
        for parent_data in request.parents:
            parent_user = session.exec(select(User).where(User.email == parent_data.email)).first()
            
            if not parent_user:
                # Completely new parent on the SaaS platform
                parent_user = User(
                    email=str(parent_data.email),
                    password_hash=hash_password("WelcomeNexus2026!"), 
                    role_id=parent_role.id,
                    school_id=context.school_id
                )
                session.add(parent_user)
                session.flush()

            # Ensure this parent has a profile SPECIFIC to this school
            parent_profile = session.exec(
                select(ParentProfile).where(
                    ParentProfile.user_id == parent_user.id,
                    ParentProfile.school_id == context.school_id
                )
            ).first()
            
            if not parent_profile:
                parent_profile = ParentProfile(
                    user_id=parent_user.id,
                    school_id=context.school_id,
                    first_name=parent_data.first_name,
                    last_name=parent_data.last_name,
                    phone_number=parent_data.phone_number,
                    address=parent_data.address,
                )
                session.add(parent_profile)
                session.flush()

            # 7. Map the Relationship Link
            relationship = build_parent_student_link(
                school=session.get(School, context.school_id),
                parent=parent_profile,
                student=student_profile,
                relationship_type=parent_data.relationship_type,
                is_primary_contact=parent_data.is_primary_contact,
                is_financial_sponsor=parent_data.is_financial_sponsor,
            )
            session.add(relationship)

        # 8. Commit everything to PostgreSQL atomically!
        session.commit()
        session.refresh(student_profile)

    except Exception as err:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Unified Onboarding Failed: {str(err)}"
        )

    # 9. Return cleanly
    return StudentResponse(
        id=student_profile.id,
        user_id=student_user.id,
        email=student_user.email,
        admission_number=student_profile.admission_number,
        class_name=target_class.name,  # 👈 Dynamically injected for the UI
        first_name=student_profile.first_name,
        last_name=student_profile.last_name,
        gender=student_profile.gender,        
        date_of_birth=student_profile.date_of_birth,
        phone_number=student_profile.phone_number,
        address=student_profile.address,
        created_at=student_profile.created_at
    )

@router.get("/", response_model=List[StudentResponse])
def list_students(
    search: Optional[str] = Query(None, description="Search by admission number"),
    class_name: Optional[str] = Query(None, alias="class", description="Filter by class name"),
    name: Optional[str] = Query(None, description="Search by first name, last name, or full name"),
    academic_session_id: Optional[UUID] = Query(None, description="Optional: specific year ID"),
    academic_term_id: Optional[UUID] = Query(None, description="Optional: specific term ID"),
    context: CurrentContext = Depends(require_permission("student:read")), # 👈 1. Gatekeeper
    session: Session = Depends(get_session)
):
    """Lists student profiles for the active tenant, joining their current contextual enrollment."""
    
    # 2. Resolve Temporal Anchors (Fallback to the school's current active term)
    if not academic_session_id or not academic_term_id:
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
        
        # If no active term exists and no query params were passed, we just skip the enrollment join 
        # or use empty IDs so we don't crash, but it means they won't show classes.
        academic_session_id = current_session.id if current_session else None
        academic_term_id = current_term.id if current_term else None

    # 3. Base Query: Join Profile -> User -> Enrollment -> Class
    # We use OUTER joins for enrollments so we still list students even if they aren't assigned to a class yet.
    query = (
        select(StudentProfile, User, SchoolClass.name)
        .join(User, StudentProfile.user_id == User.id)
        .join(
            StudentEnrollment, 
            (StudentEnrollment.student_id == StudentProfile.id) & 
            (StudentEnrollment.session_id == academic_session_id) &
            (StudentEnrollment.term_id == academic_term_id) &
            (StudentEnrollment.status == EnrollmentStatus.ACTIVE),
            isouter=True
        )
        .join(SchoolClass, StudentEnrollment.class_id == SchoolClass.id, isouter=True)
        .where(StudentProfile.school_id == context.school_id) # 👈 4. Hard Tenant Isolation
    )

    # ==========================================
    # APPLY FILTERS
    # ==========================================
    
    # Class filter (checks the dynamically joined Class table!)
    if class_name:
        query = query.where(SchoolClass.name == class_name)
        
    # Admission Number filter
    if search:
        query = query.where(StudentProfile.admission_number.ilike(f"%{search}%"))
        
    # Smart Name filter
    if name:
        search_term = f"%{name}%"
        full_name_concat = func.concat(StudentProfile.first_name, ' ', StudentProfile.last_name)
        
        query = query.where(
            or_(
                StudentProfile.first_name.ilike(search_term),
                StudentProfile.last_name.ilike(search_term),
                full_name_concat.ilike(search_term)
            )
        )
    
    results = session.exec(query.order_by(StudentProfile.created_at.desc())).all()

    # 5. Build Response
    return [
        StudentResponse(
            id=profile.id,
            user_id=user.id,
            email=user.email,
            admission_number=profile.admission_number,
            class_name=current_class_name, # 👈 Injected dynamically from the time-aware join!
            first_name=profile.first_name,
            last_name=profile.last_name,
            gender=profile.gender,               
            date_of_birth=profile.date_of_birth,
            phone_number=profile.phone_number,
            address=profile.address,
            created_at=profile.created_at
        )
        for profile, user, current_class_name in results
    ]


@router.get("/{student_id}/parents", response_model=List[LinkedParentResponse])
def get_student_linked_parents(
    student_id: UUID,
    context: CurrentContext = Depends(require_permission("student:read")),
    session: Session = Depends(get_session),
):
    """Return the parents linked to a student for authorized school staff."""
    role = session.get(Role, context.role_id)
    if not role or role.name.lower() not in {"admin", "teacher"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators and teachers can view linked parents.",
        )

    student = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == student_id,
            StudentProfile.school_id == context.school_id,
        )
    ).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found in your school.",
        )

    return fetch_linked_parents(student.id, context.school_id, session)


# ------------------------------------------------------------------
# GET: View Single Student by Admission Number
# ------------------------------------------------------------------
@router.get(
    "/{admission_number}", 
    response_model=StudentDetailResponse
)
def get_student_by_admission_number(
    admission_number: str,
    context: CurrentContext = Depends(require_permission("student:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetch a single student's complete profile, locked to the tenant, including linked parents."""
    
    # 1. SECURE FETCH: Isolate the query to the active tenant's school_id
    student_query = (
        select(StudentProfile, User)
        .join(User, StudentProfile.user_id == User.id)
        .where(
            StudentProfile.admission_number == admission_number,
            StudentProfile.school_id == context.school_id  # 👈 Prevents cross-school data leaks!
        )
    )
    student_result = session.exec(student_query).first()
    
    if not student_result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Student with admission number '{admission_number}' not found in your school."
        )
        
    profile, student_user = student_result

    # 2. Dynamically Resolve Current Class using Contextual Enrollments
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

    current_class_name = "Unassigned"
    if current_session and current_term:
        enrollment_query = (
            select(SchoolClass.name)
            .join(StudentEnrollment, StudentEnrollment.class_id == SchoolClass.id)
            .where(
                StudentEnrollment.student_id == profile.id,
                StudentEnrollment.session_id == current_session.id,
                StudentEnrollment.term_id == current_term.id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE
            )
        )
        # Grab the name, or fallback to Unassigned if they don't have an active enrollment this term
        current_class_name = session.exec(enrollment_query).first() or "Unassigned"

    # 3. Fetch Linked Parents (Passing the school_id to the upgraded helper!)
    linked_parents = fetch_linked_parents(profile.id, context.school_id, session)
    
    return StudentDetailResponse( 
        id=profile.id,
        user_id=student_user.id,
        email=student_user.email,
        admission_number=profile.admission_number,
        class_name=current_class_name,  # 👈 Injected dynamically!
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
    response_model=StudentResponse
)
def update_student_profile(
    student_id: UUID,
    payload: StudentProfileUpdate,
    context: CurrentContext = Depends(require_permission("student:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Update specific fields of a student's persistent profile, securely scoped to the tenant."""
    
    # 1. SECURE FETCH: Ensure the student profile belongs to this exact school
    profile = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == student_id,
            StudentProfile.school_id == context.school_id
        )
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Student profile not found in your school."
        )
        
    # 2. Apply updates ONLY for persistent fields
    update_data = payload.model_dump(exclude_unset=True)
    
    # 🛡️ ARCHITECTURAL GUARD: Prevent illegal class updates
    if "class_id" in update_data or "class_name" in update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Class cannot be updated via profile patch. Please use the Student Transfer workflow."
        )

    for key, value in update_data.items():
        setattr(profile, key, value)
        
    # 3. Save changes
    session.add(profile)
    session.commit()
    session.refresh(profile)

    # 4. Fetch the User account so we can return the email
    user = session.get(User, profile.user_id)

    # 5. Dynamically Resolve Current Class for the Response payload
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

    current_class_name = "Unassigned"
    if current_session and current_term:
        enrollment_query = (
            select(SchoolClass.name)
            .join(StudentEnrollment, StudentEnrollment.class_id == SchoolClass.id)
            .where(
                StudentEnrollment.student_id == profile.id,
                StudentEnrollment.session_id == current_session.id,
                StudentEnrollment.term_id == current_term.id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE
            )
        )
        current_class_name = session.exec(enrollment_query).first() or "Unassigned"

    return StudentResponse(
        id=profile.id,
        user_id=user.id,
        email=user.email,
        admission_number=profile.admission_number,
        class_name=current_class_name, # 👈 Injected dynamically
        first_name=profile.first_name,
        last_name=profile.last_name,
        gender=profile.gender,
        date_of_birth=profile.date_of_birth,
        phone_number=profile.phone_number,
        address=profile.address,
        created_at=profile.created_at
    )


from backend.app.models import StudentEnrollment, EnrollmentStatus, SchoolClass, AcademicSession, AcademicTerm

# ------------------------------------------------------------------
# POST: Single Student Transfer / Promote
# ------------------------------------------------------------------
@router.post("/{student_id}/transfer", status_code=status.HTTP_201_CREATED)
def transfer_student(
    student_id: UUID,
    payload: TransferStudentRequest,
    context: CurrentContext = Depends(require_permission("student:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Enrolls a student in a class for a specific term, deactivating any prior enrollment for that same term."""
    
    # 1. SECURE FETCH: Verify Student, Class, Session, and Term all belong to this tenant
    student = session.exec(select(StudentProfile).where(StudentProfile.id == student_id, StudentProfile.school_id == context.school_id)).first()
    target_class = session.exec(select(SchoolClass).where(SchoolClass.id == payload.class_id, SchoolClass.school_id == context.school_id)).first()
    target_session = session.exec(select(AcademicSession).where(AcademicSession.id == payload.session_id, AcademicSession.school_id == context.school_id)).first()
    target_term = session.exec(select(AcademicTerm).where(AcademicTerm.id == payload.term_id, AcademicTerm.school_id == context.school_id)).first()

    if not all([student, target_class, target_session, target_term]):
        raise HTTPException(status_code=404, detail="Invalid Student, Class, Session, or Term ID provided for your school.")

    # 2. Retire any existing active enrollment for THIS specific term (Handles mid-term transfers)
    existing_enrollment = session.exec(
        select(StudentEnrollment).where(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.session_id == payload.session_id,
            StudentEnrollment.term_id == payload.term_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE
        )
    ).first()
    
    if existing_enrollment:
        if existing_enrollment.class_id == payload.class_id:
            return {"message": "Student is already actively enrolled in this class for the specified term."}
        
        # Safely deactivate the old record so we maintain audit history
        existing_enrollment.status = EnrollmentStatus.INACTIVE
        session.add(existing_enrollment)

    # 3. Create the new time-locked V2 Contract
    new_enrollment = StudentEnrollment(
        school_id=context.school_id,
        student_id=student_id,
        class_id=payload.class_id,
        session_id=payload.session_id,
        term_id=payload.term_id,
        status=EnrollmentStatus.ACTIVE
    )
    session.add(new_enrollment)
    session.commit()
    
    return {"message": f"Successfully enrolled {student.first_name} {student.last_name} into {target_class.name}."}

# ------------------------------------------------------------------
# POST: Bulk Student Transfer / Promote
# ------------------------------------------------------------------
@router.post("/bulk-transfer", status_code=status.HTTP_201_CREATED)
def bulk_transfer_students(
    payload: BulkTransferStudentRequest,
    context: CurrentContext = Depends(require_permission("student:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Mass enrolls a list of students into a new class for a specific term."""
    
    if not payload.student_ids:
        raise HTTPException(status_code=400, detail="No students provided for transfer.")

    # 1. SECURE FETCH: Verify Class, Session, and Term
    target_class = session.exec(select(SchoolClass).where(SchoolClass.id == payload.class_id, SchoolClass.school_id == context.school_id)).first()
    target_session = session.exec(select(AcademicSession).where(AcademicSession.id == payload.session_id, AcademicSession.school_id == context.school_id)).first()
    target_term = session.exec(select(AcademicTerm).where(AcademicTerm.id == payload.term_id, AcademicTerm.school_id == context.school_id)).first()

    if not all([target_class, target_session, target_term]):
        raise HTTPException(status_code=404, detail="Invalid Class, Session, or Term ID provided for your school.")

    # 2. SECURE FETCH: Validate all students belong to the tenant
    valid_students = session.exec(
        select(StudentProfile).where(
            StudentProfile.id.in_(payload.student_ids),
            StudentProfile.school_id == context.school_id
        )
    ).all()
    
    if len(valid_students) != len(set(payload.student_ids)):
        raise HTTPException(status_code=400, detail="One or more student IDs are invalid or do not belong to your school.")

    # 3. Execute the mass transfer
    enrolled_count = 0
    for student in valid_students:
        # Deactivate previous active enrollment for this term
        existing_enrollment = session.exec(
            select(StudentEnrollment).where(
                StudentEnrollment.student_id == student.id,
                StudentEnrollment.session_id == payload.session_id,
                StudentEnrollment.term_id == payload.term_id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE
            )
        ).first()
        
        if existing_enrollment:
            if existing_enrollment.class_id == payload.class_id:
                continue # Skip if already in the target class
            existing_enrollment.status = EnrollmentStatus.INACTIVE
            session.add(existing_enrollment)

        # Create new contract
        new_enrollment = StudentEnrollment(
            school_id=context.school_id,
            student_id=student.id,
            class_id=payload.class_id,
            session_id=payload.session_id,
            term_id=payload.term_id,
            status=EnrollmentStatus.ACTIVE
        )
        session.add(new_enrollment)
        enrolled_count += 1

    session.commit()
    
    return {"message": f"Successfully enrolled {enrolled_count} students into {target_class.name}."}

# ------------------------------------------------------------------
# GET: Student Enrollment History ("Time Travel" Viewer)
# ------------------------------------------------------------------
@router.get("/{student_id}/enrollments", response_model=List[StudentEnrollmentHistoryResponse])
def get_student_enrollments(
    student_id: UUID,
    context: CurrentContext = Depends(require_permission("student:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetches the complete historical enrollment record for a student, strictly locked to the tenant."""
    
    # 1. SECURE FETCH: Verify student belongs to this school
    student = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == student_id, 
            StudentProfile.school_id == context.school_id
        )
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your school.")

    # 2. SECURE QUERY: Join the enrollment table with Class, Session, and Term tables
    statement = (
        select(StudentEnrollment, SchoolClass, AcademicSession, AcademicTerm)
        .join(SchoolClass, StudentEnrollment.class_id == SchoolClass.id)
        .join(AcademicSession, StudentEnrollment.session_id == AcademicSession.id)
        .join(AcademicTerm, StudentEnrollment.term_id == AcademicTerm.id)
        .where(
            StudentEnrollment.student_id == student_id,
            StudentEnrollment.school_id == context.school_id # 👈 Tenant Isolation
        )
        # Order by newest enrollments first based on when they were created
        .order_by(StudentEnrollment.created_at.desc())
    )
    
    results = session.exec(statement).all()
    
    # 3. Format and return the flattened data for the frontend
    return [
        StudentEnrollmentHistoryResponse(
            id=enrollment.id,
            class_id=cls.id,
            class_name=cls.name,
            session_id=academic_session.id,
            session_name=academic_session.name,
            term_id=term.id,
            # Safely handle if the frontend enum changed to a string
            term_name=term.name if isinstance(term.name, str) else term.name.value,
            status=enrollment.status,
            created_at=enrollment.created_at
        )
        for enrollment, cls, academic_session, term in results
    ]
