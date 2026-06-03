# routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from database import get_session
from models import StudentProfile
from auth_utils import RoleChecker

router = APIRouter(
    prefix="/students",
    tags=["Student Directory"]
)

# Initialize our RBAC guard specifically for Admins and Teachers
allow_staff_only = RoleChecker(["admin", "teacher"])

@router.get("/", response_model=list)
def list_students(
    session: Session = Depends(get_session),
    current_user: dict = Depends(allow_staff_only) # The Guard intercepts here!
):
    """Fetches all student profiles. Restricted to Admin and Teacher roles."""
    students = session.query(StudentProfile).all()
    return students