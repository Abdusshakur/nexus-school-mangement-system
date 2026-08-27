from fastapi import APIRouter, Depends
from sqlmodel import Session, select, func, case
from datetime import datetime, timedelta, timezone

from backend.app.db.database import get_session
# 👇 Updated V2 Gatekeeper Imports
from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.models import (
    AcademicSession,
    AcademicTerm,
    Announcement,
    AnnouncementStatus,
    AttendanceRecord,
    AttendanceSession,
    AttendanceStatus,
    EnrollmentStatus,
    ParentProfile,
    SessionStatus,
    StudentEnrollment,
    StudentProfile,
    TeacherProfile,
    User,
)
from backend.app.schemas.dashboard import (
    DashboardSummaryResponse, AttendanceTodaySummary, 
    AttendanceTrendResponse
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard Engine"]
)


def get_current_period_ids(school_id, session: Session):
    current_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.school_id == school_id,
            AcademicSession.is_current.is_(True),
        )
    ).first()
    if not current_session:
        return None, None

    current_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.school_id == school_id,
            AcademicTerm.session_id == current_session.id,
            AcademicTerm.is_current.is_(True),
        )
    ).first()
    return current_session.id, current_term.id if current_term else None

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_metrics_summary(
    context: CurrentContext = Depends(require_permission("dashboard:read")), # 👈 Tenant Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Aggregates high-level school analytics and real-time today metrics out of PostgreSQL, strictly isolated to the tenant."""
    
    school_id = context.school_id

    # 1. Gather global entity metrics using SQLModel count execution with tenant isolation
    student_count = session.exec(
        select(func.count(StudentProfile.id))
        .join(User, StudentProfile.user_id == User.id)
        .where(
            StudentProfile.school_id == school_id,
            User.school_id == school_id,
            User.is_active.is_(True),
        )
    ).one()
    
    parent_count = session.exec(
        select(func.count(ParentProfile.id))
        .join(User, ParentProfile.user_id == User.id)
        .where(
            ParentProfile.school_id == school_id,
            User.school_id == school_id,
            User.is_active.is_(True),
        )
    ).one()
    
    teacher_count = session.exec(
        select(func.count(TeacherProfile.id))
        .join(User, TeacherProfile.user_id == User.id)
        .where(
            TeacherProfile.school_id == school_id,
            User.school_id == school_id,
            User.is_active.is_(True),
        )
    ).one()
    
    active_announcements_count = session.exec(
        select(func.count(Announcement.id)).where(
            Announcement.status == AnnouncementStatus.PUBLISHED,
            Announcement.school_id == school_id
        )
    ).one()

    # 2. Track today's attendance metrics using the Session/Record architecture
    today = datetime.now(timezone.utc).date()
    current_session_id, current_term_id = get_current_period_ids(school_id, session)

    # Count how many total student attendance records have been written today for this school
    total_attendance_today = 0
    if current_session_id and current_term_id:
        total_attendance_query = (
            select(func.count(func.distinct(StudentEnrollment.student_id)))
            .join(AttendanceSession, StudentEnrollment.class_id == AttendanceSession.class_id)
            .where(
                AttendanceSession.attendance_date == today,
                AttendanceSession.school_id == school_id,
                AttendanceSession.session_id == current_session_id,
                AttendanceSession.term_id == current_term_id,
                AttendanceSession.status == SessionStatus.APPROVED,
                StudentEnrollment.school_id == school_id,
                StudentEnrollment.session_id == current_session_id,
                StudentEnrollment.term_id == current_term_id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            )
        )
        total_attendance_today = session.exec(total_attendance_query).one_or_none() or 0

    # Count how many of those records are marked PRESENT
    present_attendance_today = 0
    if current_session_id and current_term_id:
        present_attendance_query = (
            select(func.count(AttendanceRecord.id))
            .join(AttendanceSession, AttendanceRecord.session_id == AttendanceSession.id)
            .where(
                AttendanceSession.attendance_date == today,
                AttendanceSession.school_id == school_id,
                AttendanceSession.session_id == current_session_id,
                AttendanceSession.term_id == current_term_id,
                AttendanceSession.status == SessionStatus.APPROVED,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
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


@router.get("/attendance-trends", response_model=AttendanceTrendResponse)
def get_weekly_attendance_trends(
    context: CurrentContext = Depends(require_permission("dashboard:read")), # 👈 Tenant Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Computes aggregate present, absent, and late log trend time-series for the past 5 operational days, isolated to the tenant."""
    
    school_id = context.school_id
    today = datetime.now(timezone.utc).date()
    operational_dates = []
    cursor = today
    while len(operational_dates) < 5:
        if cursor.weekday() < 5:
            operational_dates.append(cursor)
        cursor -= timedelta(days=1)
    operational_dates.reverse()
    start_date = operational_dates[0]
    current_session_id, current_term_id = get_current_period_ids(school_id, session)

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
            AttendanceSession.school_id == school_id,
            AttendanceSession.session_id == current_session_id,
            AttendanceSession.term_id == current_term_id,
            AttendanceSession.status == SessionStatus.APPROVED,
        )
        .group_by(AttendanceSession.attendance_date)
        .order_by(AttendanceSession.attendance_date.asc())
    )
    
    db_results = session.exec(statement).all() if current_session_id and current_term_id else []
    metrics_by_date = {
        row[0]: {
            "present": row[1] or 0,
            "absent": row[2] or 0,
            "late": row[3] or 0,
        }
        for row in db_results
    }

    trend_report = []
    for log_date in operational_dates:
        metrics = metrics_by_date.get(log_date, {})
        day_abbreviation = log_date.strftime("%a")
        
        trend_report.append({
            "day": day_abbreviation,
            "date": str(log_date),
            "present": metrics.get("present", 0),
            "absent": metrics.get("absent", 0),
            "late": metrics.get("late", 0),
        })
        
    return trend_report
