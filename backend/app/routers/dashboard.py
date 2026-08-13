from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, case
from datetime import datetime, date, timedelta, timezone
from typing import List

from backend.app.db.database import get_session
from backend.app.core.auth_utils import RoleChecker
from backend.app.models import (
    User, UserRole, StudentProfile, ParentProfile, Announcement, 
    AttendanceSession, AttendanceRecord, AttendanceStatus # 👈 Updated models
)
from backend.app.schemas.dashboard import (
    DashboardSummaryResponse, AttendanceTodaySummary, 
    DailyAttendanceMetric, AttendanceTrendResponse
)

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

    # 2. Track today's attendance metrics using the new Session/Record architecture
    today = datetime.now(timezone.utc).date()

    # Count how many total student attendance records have been written today
    total_attendance_query = (
        select(func.count(AttendanceRecord.id))
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .where(AttendanceSession.attendance_date == today)
    )
    total_attendance_today = session.exec(total_attendance_query).one_or_none() or 0

    # Count how many of those records are marked PRESENT
    present_attendance_query = (
        select(func.count(AttendanceRecord.id))
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .where(AttendanceSession.attendance_date == today)
        .where(AttendanceRecord.status == AttendanceStatus.PRESENT)
    )
    present_attendance_today = session.exec(present_attendance_query).one_or_none() or 0

    # Calculate percentages safely to avoid division by zero errors
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


@router.get("/attendance-trends", dependencies=[Depends(allow_staff_only)])
def get_weekly_attendance_trends(session: Session = Depends(get_session)):
    """Computes aggregate present, absent, and late log trend time-series for the past 5 operational days."""
    
    # 1. Calculate the start and end date range boundary for the past 5 days
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=5)

    # 2. Query the database using SQL CASE statements for highly optimized counting
    # We join Session and Record to group statuses by the Session's date
    statement = (
        select(
            AttendanceSession.attendance_date,
            func.sum(case((AttendanceRecord.status == AttendanceStatus.PRESENT, 1), else_=0)).label("present_count"),
            func.sum(case((AttendanceRecord.status == AttendanceStatus.ABSENT, 1), else_=0)).label("absent_count"),
            func.sum(case((AttendanceRecord.status == AttendanceStatus.LATE, 1), else_=0)).label("late_count")
        )
        .join(AttendanceRecord, AttendanceSession.id == AttendanceRecord.session_id)
        .where(AttendanceSession.attendance_date >= start_date)
        .where(AttendanceSession.attendance_date <= today)
        .group_by(AttendanceSession.attendance_date)
        .order_by(AttendanceSession.attendance_date.asc())
    )
    
    db_results = session.exec(statement).all()

    # 3. Format database outputs directly to match UI Line-Chart target formats
    trend_report = []
    
    for row in db_results:
        log_date = row[0]
        day_abbreviation = log_date.strftime("%a") # e.g., "Mon", "Tue"
        
        trend_report.append({
            "day": day_abbreviation,
            "date": str(log_date),
            "present": row[1] or 0,
            "absent": row[2] or 0,
            "late": row[3] or 0
        })
        
    return trend_report