from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from backend.app.db.database import get_session
from backend.app.models import Class, Subject, TeacherProfile
from backend.app.core.auth_utils import RoleChecker
from backend.app.schemas.academic import ( AcademicEntityCreate, AcademicEntityResponse, 
                                            AcademicEntityUpdate,FormTeacherAssignRequest, ClassWithTeacherResponse )


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