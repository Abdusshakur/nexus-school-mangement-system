from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func

from backend.app.db.database import get_session
from backend.app.models import Class, Subject, TeacherProfile, AcademicSession, AcademicTerm, StudentProfile, Class, TeacherProfile, Subject
from backend.app.core.auth_utils import RoleChecker
from backend.app.schemas.academic import ( AcademicEntityCreate, AcademicEntityResponse, 
                                            AcademicEntityUpdate,FormTeacherAssignRequest, ClassWithTeacherResponse,
                                             AcademicSessionCreate, AcademicSessionResponse, AcademicTermCreate, 
                                             AcademicTermResponse, ActiveContextSummary, TermWithSessionResponse)





router = APIRouter(prefix="/academics", tags=["Academic Setup"])
allow_admin_only = RoleChecker(["admin"])


# ==========================================
# CLASSES ENDPOINTS
# ==========================================

@router.post("/classes", response_model=AcademicEntityResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_class(payload: AcademicEntityCreate, session: Session = Depends(get_session)):
    """Create a new class (e.g., 'SS 1', 'JS 1')."""
    # Prevent exact duplicates
    existing = session.exec(select(Class).where(Class.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Class '{payload.name}' already exists.")
    
    new_class = Class(name=payload.name)
    session.add(new_class)
    session.commit()
    session.refresh(new_class)
    return new_class



@router.get("/classes", response_model=List[ClassWithTeacherResponse], dependencies=[Depends(allow_admin_only)])
def list_classes(session: Session = Depends(get_session)):
    """Fetch all available classes along with their assigned form teacher."""
    
    # The isouter=True creates a LEFT OUTER JOIN
    # This guarantees classes without an assigned teacher are still returned
    statement = (
        select(Class, TeacherProfile)
        .join(TeacherProfile, Class.form_teacher_id == TeacherProfile.id, isouter=True)
        .order_by(Class.name)
    )
    
    results = session.exec(statement).all()
    
    response_data = []
    for cls, teacher in results:
        # Gracefully handle classes that don't have a teacher yet
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


@router.patch("/classes/{class_id}/form-teacher", dependencies=[Depends(allow_admin_only)])
def assign_form_teacher(
    class_id: UUID,
    request: FormTeacherAssignRequest,
    session: Session = Depends(get_session)
):
    """Assigns or unassigns a Form Teacher for a specific class."""
    
    # 1. Verify the class exists
    db_class = session.get(Class, class_id)
    if not db_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Class not found."
        )

    # 2. If assigning a teacher, verify they exist and are valid
    if request.teacher_id:
        teacher = session.get(TeacherProfile, request.teacher_id)
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Teacher profile not found."
            )
            
        # Optional Business Rule: Prevent a teacher from being Form Teacher of two classes
        existing_assignment = session.exec(
            select(Class).where(Class.form_teacher_id == request.teacher_id)
        ).first()
        
        if existing_assignment and existing_assignment.id != class_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Teacher is already the Form Teacher for {existing_assignment.name}."
            )

    # 3. Apply the update
    db_class.form_teacher_id = request.teacher_id
    session.add(db_class)
    session.commit()
    session.refresh(db_class)

    # 4. Return a clean response
    return {
        "message": "Form teacher successfully updated",
        "class_id": db_class.id,
        "class_name": db_class.name,
        "form_teacher_id": db_class.form_teacher_id
    }


@router.delete("/classes/{class_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(allow_admin_only)])
def delete_class(class_id: UUID, session: Session = Depends(get_session)):
    """Delete a class. Note: Will cascade and delete linked assignments."""
    db_class = session.get(Class, class_id)
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found.")
    
    session.delete(db_class)
    session.commit()
    return


# ==========================================
# SUBJECTS ENDPOINTS
# ==========================================

@router.post("/subjects", response_model=AcademicEntityResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_subject(payload: AcademicEntityCreate, session: Session = Depends(get_session)):
    """Create a new subject (e.g., 'Mathematics', 'Biology')."""
    existing = session.exec(select(Subject).where(Subject.name == payload.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Subject '{payload.name}' already exists.")
    
    new_subject = Subject(name=payload.name)
    session.add(new_subject)
    session.commit()
    session.refresh(new_subject)
    return new_subject


@router.get("/subjects", response_model=List[AcademicEntityResponse], dependencies=[Depends(allow_admin_only)])
def list_subjects(session: Session = Depends(get_session)):
    """Fetch all available subjects."""
    subjects = session.exec(select(Subject).order_by(Subject.name)).all()
    return subjects


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(allow_admin_only)])
def delete_subject(subject_id: UUID, session: Session = Depends(get_session)):
    """Delete a subject. Note: Will cascade and delete linked assignments."""
    db_subject = session.get(Subject, subject_id)
    if not db_subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    
    session.delete(db_subject)
    session.commit()
    return


# ==========================================
# SESSION & TERM ENDPOINTS
# ==========================================

@router.post("/sessions", response_model=AcademicSessionResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_academic_session(request: AcademicSessionCreate, db: Session = Depends(get_session)):
    """Creates a new Academic Year. Automatically deactivates the old one if set to active."""
    
    if request.is_active:
        active_sessions = db.exec(select(AcademicSession).where(AcademicSession.is_active == True)).all()
        for old in active_sessions:
            old.is_active = False
            db.add(old)
            
    new_session = AcademicSession(**request.model_dump())
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.post("/terms", response_model=AcademicTermResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_academic_term(request: AcademicTermCreate, db: Session = Depends(get_session)):
    """Creates a Term inside a Session. Automatically deactivates the old term if set to active."""
    
    parent_session = db.get(AcademicSession, request.session_id)
    if not parent_session:
        raise HTTPException(status_code=404, detail="Parent Academic Session not found.")

    if request.is_active:
        active_terms = db.exec(select(AcademicTerm).where(AcademicTerm.is_active == True)).all()
        for old in active_terms:
            old.is_active = False
            db.add(old)
            
    new_term = AcademicTerm(**request.model_dump())
    db.add(new_term)
    db.commit()
    db.refresh(new_term)
    
    return AcademicTermResponse(
        **new_term.model_dump(),
        session_name=parent_session.name
    )


@router.get("/terms/all", response_model=List[TermWithSessionResponse])
def get_all_terms_and_sessions(db: Session = Depends(get_session)):
    """Fetches a complete list of all terms and their parent sessions."""
    
    # Join AcademicTerm and AcademicSession
    statement = (
        select(AcademicTerm, AcademicSession)
        .join(AcademicSession, AcademicTerm.session_id == AcademicSession.id) # type: ignore
        .order_by(AcademicSession.start_date.desc(), AcademicTerm.start_date.desc())
    )
    
    results = db.exec(statement).all()
    
    return [
        TermWithSessionResponse(
            term_id=term.id,
            term_name=term.name.value, # Extracts 'First Term' from the Enum
            term_start_date=term.start_date,
            term_end_date=term.end_date,
            is_term_active=term.is_active,
            
            session_id=sess.id,
            session_name=sess.name,
            is_session_active=sess.is_active
        ) for term, sess in results
    ]

@router.get("/active-summary", response_model=ActiveContextSummary)
def get_active_school_context(db: Session = Depends(get_session)):
    """Fetches the active term & session, plus school-wide stats for the Admin Dashboard."""
    
    active_term = db.exec(select(AcademicTerm).where(AcademicTerm.is_active == True)).first()
    if not active_term:
        raise HTTPException(status_code=404, detail="No active term found in the system.")
        
    # Dynamically calculate stats
    students = db.exec(select(func.count(StudentProfile.id))).one_or_none() or 0
    classes = db.exec(select(func.count(Class.id))).one_or_none() or 0
    teachers = db.exec(select(func.count(TeacherProfile.id))).one_or_none() or 0
    subjects = db.exec(select(func.count(Subject.id))).one_or_none() or 0

    return ActiveContextSummary(
        active_session_name=active_term.session.name,
        active_term_name=active_term.name.value,
        term_id=active_term.id,
        session_id=active_term.session_id,
        total_students=students,
        total_classes=classes,
        active_teachers=teachers,
        total_subjects=subjects
    )