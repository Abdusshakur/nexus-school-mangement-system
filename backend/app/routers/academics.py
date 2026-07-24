from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List
from uuid import UUID

from backend.app.db.database import get_session
from backend.app.models import Class, Subject
from backend.app.core.auth_utils import RoleChecker

router = APIRouter(prefix="/academics", tags=["Academic Setup"])
allow_admin_only = RoleChecker(["admin"])
# Create a new dependency at the top of the file
allow_staff = RoleChecker(["admin", "teacher"])


# --- Schemas ---
class AcademicEntityCreate(BaseModel):
    name: str

class AcademicEntityUpdate(BaseModel):
    name: str

class AcademicEntityResponse(BaseModel):
    id: UUID
    name: str


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


@router.get("/classes", response_model=List[AcademicEntityResponse], dependencies=[Depends(allow_staff)])
def list_classes(session: Session = Depends(get_session)):
    """Fetch all available classes."""
    classes = session.exec(select(Class).order_by(Class.name)).all()
    return classes




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