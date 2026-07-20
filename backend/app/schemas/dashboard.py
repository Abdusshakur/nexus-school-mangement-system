# backend/app/schemas/dashboard.py
from pydantic import BaseModel
from pydantic import BaseModel
from typing import List

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

class DailyAttendanceMetric(BaseModel):
    day: str       # E.g., "Mon", "Tue"
    date: str      # E.g., "2026-06-22"
    present: int
    absent: int
    late: int

# Explicitly typing the list response wrapping our metrics helper structures
AttendanceTrendResponse = List[DailyAttendanceMetric]