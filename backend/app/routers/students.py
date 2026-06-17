from fastapi import APIRouter, Depends
from sqlmodel import Session

from backend.app.core.auth_utils import RoleChecker
from backend.app.db.database import get_session
from backend.app.models import StudentProfile

router = APIRouter(
    prefix="/students",
    tags=["Student Directory"],
)

allow_staff_only = RoleChecker(["admin", "teacher"])


@router.get("/", response_model=list)
def list_students(
    session: Session = Depends(get_session),
    current_user: dict = Depends(allow_staff_only),
):
    students = session.query(StudentProfile).all()
    return students
