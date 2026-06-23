# backend/app/schemas/dashboard.py
from pydantic import BaseModel

class AttendanceTodaySummary(BaseModel):
    present: int
    total: int
    percentage: int

class DashboardSummaryResponse(BaseModel):
    students: int
    parents: int
    teachers: int
    attendance_today: AttendanceTodaySummary
    active_announcements: int