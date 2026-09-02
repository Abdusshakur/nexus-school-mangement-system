from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from backend.app.db.database import get_session
from backend.app.models import ParentProfile, StudentProfile, ParentStudentLink, School
from backend.app.schemas.relationship import RelationshipCreate, RelationshipResponse
from backend.app.services.parent_relationship_service import build_parent_student_link

# 👇 V2 Gatekeeper Imports
from backend.app.core.auth_utils import CurrentContext, require_permission

router = APIRouter(
    prefix="/relationships",
    tags=["Parent-Student Relationships"]
)

# ❌ Old allow_staff_only = RoleChecker(["admin", "teacher"]) deleted

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=RelationshipResponse)
def link_parent_to_student(
    request: RelationshipCreate, 
    context: CurrentContext = Depends(require_permission("relationship:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Creates a physical link matching a parent profile to a student profile, strictly isolated to the tenant."""
    
    # 1. SECURE FETCH: Verify Parent exists AND belongs to this tenant
    parent = session.exec(
        select(ParentProfile).where(
            ParentProfile.id == request.parent_id,
            ParentProfile.school_id == context.school_id # 👈 Tenant Isolation
        )
    ).first()
    if not parent:
        raise HTTPException(status_code=404, detail="Parent profile not found in your school.")

    # 2. SECURE FETCH: Verify Student exists AND belongs to this tenant
    student = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == request.student_id,
            StudentProfile.school_id == context.school_id # 👈 Tenant Isolation
        )
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found in your school.")

    # 3. Check if they are already linked (Updated to SQLModel syntax)
    existing_link = session.exec(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == request.parent_id,
            ParentStudentLink.student_id == request.student_id,
            ParentStudentLink.school_id == context.school_id,
        )
    ).first()
    
    if existing_link:
        raise HTTPException(status_code=400, detail="This parent and student are already linked.")

    # 4. Insert the connection row 
    school = session.get(School, context.school_id)
    new_link = build_parent_student_link(
        school=school,
        parent=parent,
        student=student,
        relationship_type=request.relationship_type,
    )
    session.add(new_link)
    session.commit()

    return RelationshipResponse(
        parent_id=request.parent_id,
        student_id=request.student_id,
        relationship_type=request.relationship_type,
        message="Relationship established successfully!"
    )
