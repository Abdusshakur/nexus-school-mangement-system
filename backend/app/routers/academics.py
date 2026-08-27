from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func

from backend.app.db.database import get_session
from backend.app.models import SchoolClass, Subject, TeacherProfile, AcademicSession, AcademicTerm, StudentProfile
# 👇 1. Import the new Gatekeeper and RBAC dependencies
from backend.app.core.auth_utils import CurrentContext, get_current_context, require_permission 

from backend.app.schemas.academic import (
    AcademicEntityCreate, AcademicEntityResponse, AcademicEntityUpdate,
    FormTeacherAssignRequest, ClassWithTeacherResponse,
    AcademicSessionCreate, AcademicSessionResponse, 
    AcademicTermCreate, AcademicTermResponse, 
    ActiveContextSummary, TermWithSessionResponse
)

router = APIRouter(prefix="/academics", tags=["Academic Setup"])

# ==========================================
# CLASSES ENDPOINTS
# ==========================================

@router.post("/classes", response_model=AcademicEntityResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    payload: AcademicEntityCreate, 
    # 👇 2. Inject Gatekeeper and check permissions
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session)
):
    """Create a new class for the active school."""
    
    # 👇 3. Check for duplicates WITHIN this specific school only
    existing = session.exec(
        select(SchoolClass).where(SchoolClass.name == payload.name, SchoolClass.school_id == context.school_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Class '{payload.name}' already exists in your school.")
    
    # 👇 4. Hard-wire the school_id programmatically
    new_class = SchoolClass(name=payload.name, school_id=context.school_id)
    
    session.add(new_class)
    session.commit()
    session.refresh(new_class)
    return new_class


@router.get("/classes", response_model=List[ClassWithTeacherResponse])
def list_classes(
    context: CurrentContext = Depends(require_permission("class:read")),
    session: Session = Depends(get_session)
):
    """Fetch all available classes along with their assigned form teacher."""
    
    statement = (
        select(SchoolClass, TeacherProfile)
        .join(TeacherProfile, SchoolClass.form_teacher_id == TeacherProfile.id, isouter=True)
        # 👇 5. Isolate data so schools cannot see each other's classes
        .where(SchoolClass.school_id == context.school_id)
        .order_by(SchoolClass.name)
    )
    
    results = session.exec(statement).all()
    
    response_data = []
    for cls, teacher in results:
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unassigned"
        response_data.append(
            ClassWithTeacherResponse(
                id=cls.id,
                name=cls.name,
                form_teacher_id=cls.form_teacher_id,
                form_teacher_name=teacher_name
            )
        )
        
    return response_data


@router.patch("/classes/{class_id}", response_model=AcademicEntityResponse)
def update_class(
    class_id: UUID,
    payload: AcademicEntityUpdate,
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session),
):
    """Update a class belonging to the active school."""
    db_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.school_id == context.school_id,
        )
    ).first()

    if not db_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")

    duplicate = session.exec(
        select(SchoolClass).where(
            SchoolClass.school_id == context.school_id,
            SchoolClass.name == payload.name,
            SchoolClass.id != class_id,
        )
    ).first()
    if duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Class '{payload.name}' already exists in your school.",
        )

    db_class.name = payload.name
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    return db_class


@router.patch("/classes/{class_id}/form-teacher")
def assign_form_teacher(
    class_id: UUID,
    request: FormTeacherAssignRequest,
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session)
):
    """Assigns or unassigns a Form Teacher for a specific class."""
    
    # 👇 6. SECURE FETCH: Verify the class belongs to the user's school
    db_class = session.exec(
        select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.school_id == context.school_id)
    ).first()
    
    if not db_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")

    if request.teacher_id:
        # 👇 7. SECURE FETCH: Verify the assigned teacher ALSO belongs to this school
        teacher = session.exec(
            select(TeacherProfile).where(TeacherProfile.id == request.teacher_id, TeacherProfile.school_id == context.school_id)
        ).first()
        
        if not teacher:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher profile not found in your school.")
            
        existing_assignment = session.exec(
            select(SchoolClass).where(SchoolClass.form_teacher_id == request.teacher_id, SchoolClass.school_id == context.school_id)
        ).first()
        
        if existing_assignment and existing_assignment.id != class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Teacher is already the Form Teacher for {existing_assignment.name}."
            )

    db_class.form_teacher_id = request.teacher_id
    session.add(db_class)
    session.commit()
    session.refresh(db_class)

    return {
        "message": "Form teacher successfully updated",
        "class_id": db_class.id,
        "class_name": db_class.name,
        "form_teacher_id": db_class.form_teacher_id
    }


@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class(
    class_id: UUID, 
    context: CurrentContext = Depends(require_permission("class:delete")),
    session: Session = Depends(get_session)
):
    """Delete a class safely."""
    
    # 👇 8. SECURE FETCH: Ensure they don't delete another school's class
    db_class = session.exec(
        select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.school_id == context.school_id)
    ).first()
    
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found.")
    
    session.delete(db_class)
    session.commit()
    return


# ==========================================
# SUBJECTS ENDPOINTS
# ==========================================

@router.post("/subjects", response_model=AcademicEntityResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: AcademicEntityCreate, 
    context: CurrentContext = Depends(require_permission("subject:write")), # 👈 RBAC enforced
    session: Session = Depends(get_session)
):
    """Create a new subject scoped strictly to the active school."""
    
    # SECURE FETCH: Check duplicates only within this school
    existing = session.exec(
        select(Subject).where(Subject.name == payload.name, Subject.school_id == context.school_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject '{payload.name}' already exists in your school.")
    
    #  TENANT INJECTION: Hardwire the school_id programmatically
    new_subject = Subject(name=payload.name, school_id=context.school_id)
    
    session.add(new_subject)
    session.commit()
    session.refresh(new_subject)
    return new_subject


@router.get("/subjects", response_model=List[AcademicEntityResponse])
def list_subjects(
    context: CurrentContext = Depends(require_permission("subject:read")),
    session: Session = Depends(get_session)
):
    """Fetch all available subjects for the active school."""
    
    # TENANT FILTER: Isolate the query to prevent cross-school data leakage
    subjects = session.exec(
        select(Subject)
        .where(Subject.school_id == context.school_id)
        .order_by(Subject.name)
    ).all()
    
    return subjects


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: UUID, 
    context: CurrentContext = Depends(require_permission("subject:delete")),
    session: Session = Depends(get_session)
):
    """Delete a subject safely within the tenant boundary."""
    
    #  SECURE FETCH: Verify ownership before allowing deletion
    db_subject = session.exec(
        select(Subject).where(Subject.id == subject_id, Subject.school_id == context.school_id)
    ).first()
    
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found or access denied.")
    
    session.delete(db_subject)
    session.commit()
    return

# ==========================================
# SESSION & TERM ENDPOINTS (V2)
# ==========================================

@router.post("/sessions", response_model=AcademicSessionResponse, status_code=status.HTTP_201_CREATED)
def create_academic_session(
    request: AcademicSessionCreate, 
    context: CurrentContext = Depends(require_permission("calendar:write")),
    db: Session = Depends(get_session)
):
    """Creates a new Academic Year. Automatically updates the 'current' pointer if set to true."""
    
    # 1. Prevent duplicate session names within the school
    existing = db.exec(
        select(AcademicSession).where(AcademicSession.name == request.name, AcademicSession.school_id == context.school_id)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Session '{request.name}' already exists.")

    # 2. Handle the Unique Partial Index for 'is_current'
    if request.is_current:
        active_sessions = db.exec(
            select(AcademicSession).where(
                AcademicSession.is_current == True, 
                AcademicSession.school_id == context.school_id
            )
        ).all()
        for old in active_sessions:
            old.is_current = False
            db.add(old)
            
    # 3. Inject Tenant and Save
    new_session = AcademicSession(**request.model_dump(), school_id=context.school_id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


# ------------------------------------------------------------------
# SESSION STATE MANAGEMENT
# ------------------------------------------------------------------

@router.post("/sessions/{session_id}/activate", response_model=AcademicSessionResponse)
def activate_academic_session(
    session_id: UUID,
    context: CurrentContext = Depends(require_permission("calendar:write")),
    db: Session = Depends(get_session)
):
    """Sets a specific session as the current active session, deactivating all others."""
    
    # 1. Secure Fetch
    target_session = db.exec(
        select(AcademicSession).where(
            AcademicSession.id == session_id, 
            AcademicSession.school_id == context.school_id
        )
    ).first()
    
    if not target_session:
        raise HTTPException(status_code=404, detail="Academic Session not found.")

    if target_session.is_current:
        return target_session # Already active, do nothing

    # 2. Deactivate currently active sessions
    active_sessions = db.exec(
        select(AcademicSession).where(
            AcademicSession.is_current == True, 
            AcademicSession.school_id == context.school_id
        )
    ).all()
    
    for old in active_sessions:
        old.is_current = False
        db.add(old)

    # 3. Activate target and save
    target_session.is_current = True
    db.add(target_session)
    db.commit()
    db.refresh(target_session)
    
    return target_session


@router.post("/sessions/{session_id}/close", response_model=AcademicSessionResponse)
def close_academic_session(
    session_id: UUID,
    context: CurrentContext = Depends(require_permission("calendar:write")),
    db: Session = Depends(get_session)
):
    """Closes an active session. (Warning: System will have no active session until a new one is activated)."""
    
    target_session = db.exec(
        select(AcademicSession).where(
            AcademicSession.id == session_id, 
            AcademicSession.school_id == context.school_id
        )
    ).first()
    
    if not target_session:
        raise HTTPException(status_code=404, detail="Academic Session not found.")

    target_session.is_current = False
    db.add(target_session)
    db.commit()
    db.refresh(target_session)
    
    return target_session


@router.post("/sessions/{session_id}/terms", response_model=AcademicTermResponse, status_code=status.HTTP_201_CREATED)
def create_academic_term(
    session_id: UUID,
    request: AcademicTermCreate, 
    context: CurrentContext = Depends(require_permission("calendar:write")),
    db: Session = Depends(get_session)
):
    """Creates a term inside a session. Automatically updates the current pointer if requested."""
    
    # 1. Secure Fetch: Verify Parent Session
    parent_session = db.exec(
        select(AcademicSession).where(AcademicSession.id == session_id, AcademicSession.school_id == context.school_id)
    ).first()
    if not parent_session:
        raise HTTPException(status_code=404, detail="Parent Academic Session not found.")

    # 2. Handle the Unique Partial Index for 'is_current'
    if request.is_current:
        active_terms = db.exec(
            select(AcademicTerm).where(
                AcademicTerm.is_current == True,
                AcademicTerm.school_id == context.school_id
            )
        ).all()
        for old in active_terms:
            old.is_current = False
            db.add(old)
            
    new_term = AcademicTerm(
        **request.model_dump(), 
        session_id=session_id, 
        school_id=context.school_id
    )
    db.add(new_term)
    db.commit()
    db.refresh(new_term)
    
    return AcademicTermResponse(
        **new_term.model_dump(exclude={"id", "session_id"}),
        id=new_term.id,
        session_id=new_term.session_id,
        session_name=parent_session.name
    )



# ------------------------------------------------------------------
# TERM STATE MANAGEMENT
# ------------------------------------------------------------------

@router.post("/terms/{term_id}/open", response_model=AcademicTermResponse)
def open_academic_term(
    term_id: UUID,
    context: CurrentContext = Depends(require_permission("calendar:write")),
    db: Session = Depends(get_session)
):
    """Sets a specific term as the current active term for its session."""
    
    # 1. Secure Fetch (Includes joining Session to get the name for the response schema)
    target_term = db.exec(
        select(AcademicTerm).where(
            AcademicTerm.id == term_id, 
            AcademicTerm.school_id == context.school_id
        )
    ).first()
    
    if not target_term:
        raise HTTPException(status_code=404, detail="Academic Term not found.")
        
    parent_session = db.get(AcademicSession, target_term.session_id)

    # 2. Deactivate currently active terms
    active_terms = db.exec(
        select(AcademicTerm).where(
            AcademicTerm.is_current == True, 
            AcademicTerm.school_id == context.school_id
        )
    ).all()
    
    for old in active_terms:
        old.is_current = False
        db.add(old)

    # 3. Activate target
    target_term.is_current = True
    db.add(target_term)
    db.commit()
    db.refresh(target_term)
    
    return AcademicTermResponse(
        **target_term.model_dump(exclude={"id", "session_id"}),
        id=target_term.id,
        session_id=target_term.session_id,
        session_name=parent_session.name if parent_session else "Unknown Session"
    )


@router.get("/terms/all", response_model=List[TermWithSessionResponse])
def get_all_terms_and_sessions(
    context: CurrentContext = Depends(require_permission("calendar:read")),
    db: Session = Depends(get_session)
):
    """Fetches all terms and their parent sessions, strictly scoped to the tenant."""
    
    statement = (
        select(AcademicTerm, AcademicSession)
        .join(AcademicSession, AcademicTerm.session_id == AcademicSession.id)
        .where(AcademicSession.school_id == context.school_id)
        .order_by(AcademicSession.start_date.desc(), AcademicTerm.start_date.desc())
    )
    
    results = db.exec(statement).all()
    
    # Note: Ensure your TermWithSessionResponse schema is updated to expect 'status' and 'is_current' 
    # instead of the old 'is_active' boolean.
    return [
        {
            "term_id": term.id,
            "term_name": term.name,          # No more .value needed!
            "term_type": term.period_type, 
            "term_start_date": term.start_date,
            "term_end_date": term.end_date,
            "term_status": term.status,
            "is_term_current": term.is_current,
            
            "session_id": sess.id,
            "session_name": sess.name,
            "session_status": sess.status,
            "is_session_current": sess.is_current
        } for term, sess in results
    ]

@router.get("/active-summary", response_model=ActiveContextSummary)
def get_active_school_context(
    context: CurrentContext = Depends(get_current_context),
    db: Session = Depends(get_session),
):
    """Fetches the current term and session, plus tenant-scoped dashboard stats."""
    
    active_term = db.exec(
        select(AcademicTerm).where(
            AcademicTerm.school_id == context.school_id,
            AcademicTerm.is_current == True,
        )
    ).first()
    if not active_term:
        raise HTTPException(status_code=404, detail="No active term found in the system.")

    parent_session = db.get(AcademicSession, active_term.session_id)
    if not parent_session or parent_session.school_id != context.school_id:
        raise HTTPException(status_code=404, detail="Parent academic session not found.")
        
    # Dynamically calculate stats
    students = db.exec(select(func.count(StudentProfile.id)).where(StudentProfile.school_id == context.school_id)).one_or_none() or 0
    classes = db.exec(select(func.count(SchoolClass.id)).where(SchoolClass.school_id == context.school_id)).one_or_none() or 0
    teachers = db.exec(select(func.count(TeacherProfile.id)).where(TeacherProfile.school_id == context.school_id)).one_or_none() or 0
    subjects = db.exec(select(func.count(Subject.id)).where(Subject.school_id == context.school_id)).one_or_none() or 0

    return ActiveContextSummary(
        active_session_name=parent_session.name,
        active_term_name=active_term.name,
        term_id=active_term.id,
        session_id=active_term.session_id,
        total_students=students,
        total_classes=classes,
        active_teachers=teachers,
        total_subjects=subjects
    )
