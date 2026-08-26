from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, case
from datetime import datetime, date, timedelta, timezone
from typing import List

from backend.app.db.database import get_session
# 👇 Updated V2 Gatekeeper Imports
from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.models import (
    User, UserRole, StudentProfile, ParentProfile, Announcement, 
    AttendanceSession, AttendanceRecord, AttendanceStatus
)
from backend.app.schemas.dashboard import (
    DashboardSummaryResponse, AttendanceTodaySummary, 
    DailyAttendanceMetric, AttendanceTrendResponse
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Engine"]
)

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_metrics_summary(
    context: CurrentContext = Depends(require_permission("dashboard:read")), # 👈 Tenant Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Aggregates high-level school analytics and real-time today metrics out of PostgreSQL, strictly isolated to the tenant."""
    
    school_id = context.school_id

    # 1. Gather global entity metrics using SQLModel count execution with tenant isolation
    student_count = session.exec(
        select(func.count(StudentProfile.id)).where(StudentProfile.school_id == school_id)
    ).one()
    
    parent_count = session.exec(
        select(func.count(ParentProfile.id)).where(ParentProfile.school_id == school_id)
    ).one()
    
    # Assuming User profiles are linked via UserSchoolLink or have school_id
    teacher_count = session.exec(
        select(func.count(User.id)).where(
            User.role == UserRole.TEACHER,
            User.school_id == school_id
        )
    ).one()
    
    active_announcements_count = session.exec(
        select(func.count(Announcement.id)).where(
            Announcement.status == "PUBLISHED",
            Announcement.school_id == school_id
        )
    ).one()

    # 2. Track today's attendance metrics using the Session/Record architecture
    today = datetime.now(timezone.utc).date()

    # Count how many total student attendance records have been written today for this school
    total_attendance_query = (
        select(func.count(AttendanceRecord.id))
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .where(
            AttendanceSession.attendance_date == today,
            AttendanceSession.school_id == school_id
        )
    )
    total_attendance_today = session.exec(total_attendance_query).one_or_none() or 0

    # Count how many of those records are marked PRESENT
    present_attendance_query = (
        select(func.count(AttendanceRecord.id))
        .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
        .where(
            AttendanceSession.attendance_date == today,
            AttendanceSession.school_id == school_id,
            AttendanceRecord.status == AttendanceStatus.PRESENT
        )
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


@router.get("/attendance-trends")
def get_weekly_attendance_trends(
    context: CurrentContext = Depends(require_permission("dashboard:read")), # 👈 Tenant Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Computes aggregate present, absent, and late log trend time-series for the past 5 operational days, isolated to the tenant."""
    
    school_id = context.school_id
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=5)

    # Query the database using SQL CASE statements with tenant scope
    statement = (
        select(
            AttendanceSession.attendance_date,
            func.sum(case((AttendanceRecord.status == AttendanceStatus.PRESENT, 1), else_=0)).label("present_count"),
            func.sum(case((AttendanceRecord.status == AttendanceStatus.ABSENT, 1), else_=0)).label("absent_count"),
            func.sum(case((AttendanceRecord.status == AttendanceStatus.LATE, 1), else_=0)).label("late_count")
        )
        .join(AttendanceRecord, AttendanceSession.id == AttendanceRecord.session_id)
        .where(
            AttendanceSession.attendance_date >= start_date,
            AttendanceSession.attendance_date <= today,
            AttendanceSession.school_id == school_id
        )
        .group_by(AttendanceSession.attendance_date)
        .order_by(AttendanceSession.attendance_date.asc())
    )
    
    db_results = session.exec(statement).all()

    trend_report = []
    for row in db_results:
        log_date = row[0]
        day_abbreviation = log_date.strftime("%a")
        
        trend_report.append({
            "day": day_abbreviation,
            "date": str(log_date),
            "present": row[1] or 0,
            "absent": row[2] or 0,
            "late": row[3] or 0
        })
        
    return trend_report