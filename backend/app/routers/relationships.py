# backend/app/routers/relationships.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from backend.app.db.database import get_session
from backend.app.models import ParentProfile, StudentProfile, ParentStudentLink
from backend.app.schemas.relationship import RelationshipCreate, RelationshipResponse
from backend.app.core.auth_utils import RoleChecker

router = APIRouter(
    prefix="/relationships",
    tags=["Parent-Student Relationships"]
)

allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RelationshipResponse, dependencies=[Depends(allow_staff_only)])
def link_parent_to_student(request: RelationshipCreate, session: Session = Depends(get_session)):
    """Creates a physical link matching a parent profile to a student profile."""
    
    # 1. Verify Parent exists
    parent = session.get(ParentProfile, request.parent_id)
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found")

    # 2. Verify Student exists
    student = session.get(StudentProfile, request.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # 3. Check if they are already linked to avoid duplicate entries
    existing_link = session.query(ParentStudentLink).filter(
        ParentStudentLink.parent_id == request.parent_id,
        ParentStudentLink.student_id == request.student_id
    ).first()
    
    if existing_link:
        raise HTTPException(status_code=400, detail="This parent and student are already linked")

    # 4. Insert the connection row into our join table
    new_link = ParentStudentLink(
        parent_id=request.parent_id,
        student_id=request.student_id,
        relationship_type=request.relationship_type
        # Note: If your current ParentStudentLink model doesn't have relationship_type yet, 
        # it just pairs the IDs. We save it directly:
    )
    session.add(new_link)
    session.commit()

    return RelationshipResponse(
        parent_id=request.parent_id,
        student_id=request.student_id,
        relationship_type=request.relationship_type,
        message="Relationship established successfully!"
    )