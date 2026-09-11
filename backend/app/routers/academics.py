from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import func

from backend.app.db.database import get_session
from backend.app.models import (
    AcademicSession,
    AcademicTerm,
    ClassGroup,
    GroupSubject,
    SchoolClass,
    Subject,
    TeacherProfile,
    StudentProfile,
)
# 👇 1. Import the new Gatekeeper and RBAC dependencies
from backend.app.core.auth_utils import CurrentContext, get_active_context, require_permission 

from backend.app.schemas.academic import (
    SubjectCreate, SubjectUpdate, SubjectResponse,
    FormTeacherAssignRequest, ClassWithTeacherResponse,
    AcademicSessionCreate, AcademicSessionResponse, 
    AcademicTermCreate, AcademicTermResponse, 
    ActiveContextSummary, TermWithSessionResponse,
    ClassCreate, ClassUpdate, ClassGroupCreate, ClassGroupUpdate,
    ClassGroupResponse, GroupSubjectCreate, GroupSubjectUpdate,
    GroupSubjectResponse, ClassSubjectResponse,
)
from backend.app.services.curriculum_service import (
    get_class_group,
    get_subjects_for_class,
    validate_academic_context,
)

router = APIRouter(prefix="/academics", tags=["Academic Setup"])

# ==========================================
# CLASSES ENDPOINTS
# ==========================================

@router.post("/classes", response_model=ClassWithTeacherResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    payload: ClassCreate,
    # 👇 2. Inject Gatekeeper and check permissions
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session)
):
    """Create a new class for the active school."""
    
    # 👇 3. Check for duplicates WITHIN this specific school only
    existing = session.exec(
        select(SchoolClass).where(SchoolClass.name == payload.name.strip(), SchoolClass.school_id == context.school_id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail=f"Class '{payload.name}' already exists in your school.")
    
    # 👇 4. Hard-wire the school_id programmatically
    if payload.group_id:
        group = session.exec(select(ClassGroup).where(
            ClassGroup.id == payload.group_id,
            ClassGroup.school_id == context.school_id,
            ClassGroup.is_active.is_(True),
        )).first()
        if not group:
            raise HTTPException(status_code=400, detail="Curriculum group not found or inactive.")

    new_class = SchoolClass(name=payload.name.strip(), group_id=payload.group_id, school_id=context.school_id)
    
    session.add(new_class)
    session.commit()
    session.refresh(new_class)
    return ClassWithTeacherResponse(
        id=new_class.id,
        name=new_class.name,
        form_teacher_id=None,
        form_teacher_name="Unassigned",
        group_id=new_class.group_id,
        group_name=group.name if payload.group_id else None,
        curriculum_configured=bool(payload.group_id),
    )


@router.get("/classes", response_model=List[ClassWithTeacherResponse])
def list_classes(
    context: CurrentContext = Depends(require_permission("class:read")),
    session: Session = Depends(get_session)
):
    """Fetch all available classes along with their assigned form teacher."""
    
    statement = (
        select(SchoolClass, TeacherProfile, ClassGroup)
        .join(TeacherProfile, SchoolClass.form_teacher_id == TeacherProfile.id, isouter=True)
        .join(ClassGroup, SchoolClass.group_id == ClassGroup.id, isouter=True)
        # 👇 5. Isolate data so schools cannot see each other's classes
        .where(SchoolClass.school_id == context.school_id)
        .order_by(SchoolClass.name)
    )
    
    results = session.exec(statement).all()
    
    response_data = []
    for cls, teacher, group in results:
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unassigned"
        response_data.append(
            ClassWithTeacherResponse(
                id=cls.id,
                name=cls.name,
                form_teacher_id=cls.form_teacher_id,
                form_teacher_name=teacher_name,
                group_id=cls.group_id,
                group_name=group.name if group else None,
                curriculum_configured=bool(group and group.is_active),
            )
        )
        
    return response_data


@router.patch("/classes/{class_id}", response_model=ClassWithTeacherResponse)
def update_class(
    class_id: UUID,
    payload: ClassUpdate,
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

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one class field is required.")
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
        duplicate = session.exec(select(SchoolClass).where(
            SchoolClass.school_id == context.school_id,
            SchoolClass.name == update_data["name"],
            SchoolClass.id != class_id,
        )).first()
        if duplicate:
            raise HTTPException(status_code=400, detail=f"Class '{update_data['name']}' already exists in your school.")
    if "group_id" in update_data and update_data["group_id"] is not None:
        group = session.exec(select(ClassGroup).where(
            ClassGroup.id == update_data["group_id"],
            ClassGroup.school_id == context.school_id,
            ClassGroup.is_active.is_(True),
        )).first()
        if not group:
            raise HTTPException(status_code=400, detail="Curriculum group not found or inactive.")
    for field, value in update_data.items():
        setattr(db_class, field, value)
    session.add(db_class)
    session.commit()
    session.refresh(db_class)
    group = session.get(ClassGroup, db_class.group_id) if db_class.group_id else None
    return ClassWithTeacherResponse(
        id=db_class.id,
        name=db_class.name,
        form_teacher_id=db_class.form_teacher_id,
        form_teacher_name="Unassigned",
        group_id=db_class.group_id,
        group_name=group.name if group else None,
        curriculum_configured=bool(group and group.is_active),
    )


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


# ==========================================
# CLASS GROUP AND CURRICULUM ENDPOINTS
# ==========================================

def _group_subject_response(group_subject: GroupSubject, subject: Subject) -> GroupSubjectResponse:
    return GroupSubjectResponse(
        id=group_subject.id,
        group_id=group_subject.group_id,
        subject_id=subject.id,
        subject_name=subject.name,
        subject_code=subject.code,
        academic_session_id=group_subject.academic_session_id,
        academic_term_id=group_subject.academic_term_id,
        is_required=group_subject.is_required,
        is_active=group_subject.is_active,
    )


@router.post("/class-groups", response_model=ClassGroupResponse, status_code=status.HTTP_201_CREATED)
def create_class_group(
    payload: ClassGroupCreate,
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session),
):
    name = payload.name.strip()
    existing = session.exec(select(ClassGroup).where(
        ClassGroup.school_id == context.school_id,
        ClassGroup.name == name,
    )).first()
    if existing:
        raise HTTPException(status_code=409, detail=f"Class group '{name}' already exists in your school.")
    group = ClassGroup(school_id=context.school_id, name=name, description=payload.description)
    session.add(group)
    session.commit()
    session.refresh(group)
    return group


@router.get("/class-groups", response_model=List[ClassGroupResponse])
def list_class_groups(
    context: CurrentContext = Depends(require_permission("class:read")),
    session: Session = Depends(get_session),
):
    return session.exec(select(ClassGroup).where(
        ClassGroup.school_id == context.school_id
    ).order_by(ClassGroup.name)).all()


@router.get("/class-groups/{group_id}", response_model=ClassGroupResponse)
def get_class_group_endpoint(
    group_id: UUID,
    context: CurrentContext = Depends(require_permission("class:read")),
    session: Session = Depends(get_session),
):
    group = session.exec(select(ClassGroup).where(
        ClassGroup.id == group_id,
        ClassGroup.school_id == context.school_id,
    )).first()
    if not group:
        raise HTTPException(status_code=404, detail="Class group not found.")
    return group


@router.patch("/class-groups/{group_id}", response_model=ClassGroupResponse)
def update_class_group(
    group_id: UUID,
    payload: ClassGroupUpdate,
    context: CurrentContext = Depends(require_permission("class:write")),
    session: Session = Depends(get_session),
):
    group = session.exec(select(ClassGroup).where(
        ClassGroup.id == group_id,
        ClassGroup.school_id == context.school_id,
    )).first()
    if not group:
        raise HTTPException(status_code=404, detail="Class group not found.")
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(status_code=400, detail="At least one class group field is required.")
    if "name" in values:
        values["name"] = values["name"].strip()
        duplicate = session.exec(select(ClassGroup).where(
            ClassGroup.school_id == context.school_id,
            ClassGroup.name == values["name"],
            ClassGroup.id != group_id,
        )).first()
        if duplicate:
            raise HTTPException(status_code=409, detail=f"Class group '{values['name']}' already exists in your school.")
    for field, value in values.items():
        setattr(group, field, value)
    session.add(group)
    session.commit()
    session.refresh(group)
    return group


@router.post("/class-groups/{group_id}/subjects", response_model=GroupSubjectResponse, status_code=status.HTTP_201_CREATED)
def assign_group_subject(
    group_id: UUID,
    payload: GroupSubjectCreate,
    context: CurrentContext = Depends(require_permission("subject:write")),
    session: Session = Depends(get_session),
):
    group = session.exec(select(ClassGroup).where(
        ClassGroup.id == group_id,
        ClassGroup.school_id == context.school_id,
        ClassGroup.is_active.is_(True),
    )).first()
    subject = session.exec(select(Subject).where(
        Subject.id == payload.subject_id,
        Subject.school_id == context.school_id,
    )).first()
    if not group or not subject:
        raise HTTPException(status_code=404, detail="Class group or subject not found in your school.")
    validate_academic_context(
        context.school_id,
        payload.academic_session_id,
        payload.academic_term_id,
        session,
    )
    duplicate = session.exec(select(GroupSubject).where(
        GroupSubject.school_id == context.school_id,
        GroupSubject.group_id == group_id,
        GroupSubject.subject_id == payload.subject_id,
        GroupSubject.academic_session_id == payload.academic_session_id,
        GroupSubject.academic_term_id == payload.academic_term_id,
    )).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="This subject is already assigned to the group for this term.")
    group_subject = GroupSubject(
        school_id=context.school_id,
        group_id=group_id,
        subject_id=payload.subject_id,
        academic_session_id=payload.academic_session_id,
        academic_term_id=payload.academic_term_id,
        is_required=payload.is_required,
    )
    session.add(group_subject)
    session.commit()
    session.refresh(group_subject)
    return _group_subject_response(group_subject, subject)


@router.get("/class-groups/{group_id}/subjects", response_model=List[GroupSubjectResponse])
def list_group_subjects(
    group_id: UUID,
    academic_session_id: UUID,
    academic_term_id: UUID,
    context: CurrentContext = Depends(require_permission("subject:read")),
    session: Session = Depends(get_session),
):
    group = session.exec(select(ClassGroup).where(
        ClassGroup.id == group_id,
        ClassGroup.school_id == context.school_id,
    )).first()
    if not group:
        raise HTTPException(status_code=404, detail="Class group not found.")
    validate_academic_context(context.school_id, academic_session_id, academic_term_id, session)
    rows = session.exec(select(GroupSubject, Subject).join(
        Subject, GroupSubject.subject_id == Subject.id
    ).where(
        GroupSubject.school_id == context.school_id,
        GroupSubject.group_id == group_id,
        GroupSubject.academic_session_id == academic_session_id,
        GroupSubject.academic_term_id == academic_term_id,
        GroupSubject.is_active.is_(True),
    ).order_by(Subject.name)).all()
    return [_group_subject_response(item, subject) for item, subject in rows]


@router.patch("/group-subjects/{group_subject_id}", response_model=GroupSubjectResponse)
def update_group_subject(
    group_subject_id: UUID,
    payload: GroupSubjectUpdate,
    context: CurrentContext = Depends(require_permission("subject:write")),
    session: Session = Depends(get_session),
):
    row = session.exec(select(GroupSubject).where(
        GroupSubject.id == group_subject_id,
        GroupSubject.school_id == context.school_id,
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group subject assignment not found.")
    values = payload.model_dump(exclude_unset=True)
    if not values:
        raise HTTPException(status_code=400, detail="At least one group subject field is required.")
    for field, value in values.items():
        setattr(row, field, value)
    row.updated_at = datetime.now(timezone.utc)
    session.add(row)
    session.commit()
    subject = session.get(Subject, row.subject_id)
    return _group_subject_response(row, subject)


@router.delete("/group-subjects/{group_subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_group_subject(
    group_subject_id: UUID,
    context: CurrentContext = Depends(require_permission("subject:write")),
    session: Session = Depends(get_session),
):
    row = session.exec(select(GroupSubject).where(
        GroupSubject.id == group_subject_id,
        GroupSubject.school_id == context.school_id,
    )).first()
    if not row:
        raise HTTPException(status_code=404, detail="Group subject assignment not found.")
    row.is_active = False
    row.updated_at = datetime.now(timezone.utc)
    session.add(row)
    session.commit()
    return


@router.get("/classes/{class_id}/subjects", response_model=ClassSubjectResponse)
def list_class_subjects(
    class_id: UUID,
    academic_session_id: Optional[UUID] = None,
    academic_term_id: Optional[UUID] = None,
    context: CurrentContext = Depends(require_permission("subject:read")),
    session: Session = Depends(get_session),
):
    school_class, group = get_class_group(class_id, context.school_id, session)
    if not group:
        return ClassSubjectResponse(
            class_id=school_class.id,
            class_name=school_class.name,
            group_id=None,
            group_name=None,
            curriculum_configured=False,
            subjects=[],
        )
    if not academic_session_id or not academic_term_id:
        active_session = session.exec(select(AcademicSession).where(
            AcademicSession.school_id == context.school_id,
            AcademicSession.is_current.is_(True),
        )).first()
        active_term = session.exec(select(AcademicTerm).where(
            AcademicTerm.school_id == context.school_id,
            AcademicTerm.session_id == active_session.id if active_session else False,
            AcademicTerm.is_current.is_(True),
        )).first()
        if not active_session or not active_term:
            raise HTTPException(status_code=400, detail="Academic session and term are required when no active context exists.")
        academic_session_id = active_session.id
        academic_term_id = active_term.id
    _, _, rows = get_subjects_for_class(
        class_id, context.school_id, academic_session_id, academic_term_id, session
    )
    return ClassSubjectResponse(
        class_id=school_class.id,
        class_name=school_class.name,
        group_id=group.id,
        group_name=group.name,
        curriculum_configured=True,
        subjects=[_group_subject_response(item, subject) for item, subject in rows],
    )


# ==========================================
# SUBJECTS ENDPOINTS
# ==========================================

@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    payload: SubjectCreate,
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
    new_subject = Subject(
        name=payload.name.strip(),
        code=payload.code,
        description=payload.description,
        school_id=context.school_id,
    )
    
    session.add(new_subject)
    session.commit()
    session.refresh(new_subject)
    return new_subject


@router.get("/subjects", response_model=List[SubjectResponse])
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


@router.patch("/subjects/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: UUID,
    payload: SubjectUpdate,
    context: CurrentContext = Depends(require_permission("subject:write")),
    session: Session = Depends(get_session)
):
    """Update a subject belonging to the active school."""
    db_subject = session.exec(
        select(Subject).where(Subject.id == subject_id, Subject.school_id == context.school_id)
    ).first()

    if not db_subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found.")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one subject field is required.")

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
        if not update_data["name"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subject name cannot be blank.")
        duplicate = session.exec(
            select(Subject).where(
                Subject.school_id == context.school_id,
                Subject.name == update_data["name"],
                Subject.id != subject_id,
            )
        ).first()
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject '{update_data['name']}' already exists in your school.",
            )

    for field, value in update_data.items():
        setattr(db_subject, field, value)

    session.add(db_subject)
    session.commit()
    session.refresh(db_subject)
    return db_subject

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
    context: CurrentContext = Depends(get_active_context),
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
