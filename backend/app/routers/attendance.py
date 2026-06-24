# backend/app/routers/attendance.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import datetime
from uuid import UUID  # Ensure UUID is imported here!
from backend.app.db.database import get_session
from backend.app.models import Attendance
from backend.app.schemas.attendance import BulkAttendanceCreate, AttendanceResponse
from backend.app.core.auth_utils import RoleChecker

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"]
)

allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AttendanceResponse)
def record_bulk_attendance(
    request: BulkAttendanceCreate, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(allow_staff_only)
):
    """Processes bulk student class rolls and writes logs straight into PostgreSQL."""
    
    staff_user_id_str = current_user.get("user_id")
    if not staff_user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token details")

    try:
        # Convert the string user_id into a strict UUID object
        staff_user_id = UUID(staff_user_id_str)
        
        # Create a naive datetime object (no tzinfo) to avoid database column errors
        attendance_datetime = datetime.combine(request.attendance_date, datetime.min.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid data formats processed.")

    for record in request.records:
        db_attendance = Attendance(
            # Force conversion of the incoming student ID to a strict UUID object
            student_id=UUID(str(record.student_id)),
            class_name=request.class_name,
            status=record.status,
            attendance_date=attendance_datetime,
            recorded_by=staff_user_id
        )
        session.add(db_attendance)

    session.commit()

    return AttendanceResponse(
        message=f"Attendance logs for {request.class_name} recorded seamlessly!",
        records_processed=len(request.records)
    )