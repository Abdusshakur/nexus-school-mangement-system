# backend/app/routers/dashboard.py
from fastapi import APIRouter, Depends
from sqlmodel import Session
from datetime import datetime, time, timezone
from backend.app.db.database import get_session
from backend.app.models import User, UserRole, StudentProfile, ParentProfile, Announcement, Attendance, AttendanceStatus
from backend.app.schemas.dashboard import DashboardSummaryResponse, AttendanceTodaySummary
from backend.app.core.auth_utils import RoleChecker

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Engine"]
)

# Protect route: Only staff should see school-wide metrics
allow_staff_only = RoleChecker(["admin", "teacher"])

@router.get("/summary", response_model=DashboardSummaryResponse, dependencies=[Depends(allow_staff_only)])
def get_dashboard_metrics_summary(session: Session = Depends(get_session)):
    """Aggregates high-level school analytics and real-time today metrics out of PostgreSQL."""
    
    # 1. Gather global entity metrics using fast database counting
    student_count = session.query(StudentProfile).count()
    parent_count = session.query(ParentProfile).count()
    teacher_count = session.query(User).filter(User.role == UserRole.TEACHER).count()
    active_announcements_count = session.query(Announcement).filter(Announcement.status == "PUBLISHED").count()

    # 2. Track today's attendance metrics
    today_start = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
    today_end = datetime.combine(datetime.now(timezone.utc).date(), time.max, tzinfo=timezone.utc)

    # Count how many attendance rows have been written today
    total_attendance_today = session.query(Attendance).filter(
        Attendance.attendance_date >= today_start,
        Attendance.attendance_date <= today_end
    ).count()

    # Count how many of those rows are marked PRESENT
    present_attendance_today = session.query(Attendance).filter(
        Attendance.attendance_date >= today_start,
        Attendance.attendance_date <= today_end,
        Attendance.status == AttendanceStatus.PRESENT
    ).count()

    # Calculate percentages safely to avoid division by zero errors if roll hasn't been taken yet
    attendance_percentage = 0
    if total_attendance_today > 0:
        attendance_percentage = round((present_attendance_today / total_attendance_today) * 100)

    return DashboardSummaryResponse(
        students=student_count,
        parents=parent_count,
        teachers=teacher_count,
        active_announcements=active_announcements_count,
        attendance_today=AttendanceTodaySummary(
            present=present_attendance_today,
            total=total_attendance_today,
            percentage=attendance_percentage
        )
    )