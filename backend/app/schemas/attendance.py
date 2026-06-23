# backend/app/schemas/attendance.py
from pydantic import BaseModel
from uuid import UUID
from typing import List
from datetime import date
from backend.app.models import AttendanceStatus

class SingleStudentAttendance(BaseModel):
    student_id: UUID
    status: AttendanceStatus

class BulkAttendanceCreate(BaseModel):
    attendance_date: date
    class_name: str  # e.g., "Grade-10" or "Class-1A"
    records: List[SingleStudentAttendance]

class AttendanceResponse(BaseModel):
    message: str
    records_processed: int