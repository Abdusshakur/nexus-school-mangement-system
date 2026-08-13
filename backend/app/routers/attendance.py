# backend/app/routers/attendance.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from datetime import datetime
from uuid import UUID  # Ensure UUID is imported here!
from backend.app.db.database import get_session
from backend.app.schemas.attendance import ( AttendanceSubmitRequest, AttendanceSubmitResponse, 
                                            DailyAttendanceSummaryResponse, ClassAttendanceSummary, AttendanceStatus)
from backend.app.core.auth_utils import RoleChecker
from backend.app.db.database import get_session
from backend.app.models import (
    Class, TeacherProfile, StudentProfile, 
    AttendanceSession, AttendanceRecord, AttendanceStatus, SessionStatus
)

router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"]
)

allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AttendanceSubmitResponse)
def submit_class_attendance(
    request: AttendanceSubmitRequest, 
    session: Session = Depends(get_session),
    current_user: dict = Depends(allow_staff_only)
):
    """Creates a locked daily attendance session for a class and records all students."""
    
    staff_user_id = UUID(current_user.get("user_id"))

    # 1. Verify the class actually exists
    db_class = session.get(Class, request.class_id)
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found.")

    # 2. ENFORCE THE RULE: Only one session per class, per day!
    existing_session = session.exec(
        select(AttendanceSession)
        .where(AttendanceSession.class_id == request.class_id)
        .where(AttendanceSession.attendance_date == request.attendance_date)
    ).first()

    if existing_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Attendance for {db_class.name} on {request.attendance_date} has already been submitted."
        )

    # 3. Create the Master Session (Parent)
    new_session = AttendanceSession(
        class_id=request.class_id,
        attendance_date=request.attendance_date,
        status=SessionStatus.SUBMITTED,
        recorded_by_id=staff_user_id
    )
    session.add(new_session)
    session.flush() # Flushes to DB immediately so we can get new_session.id

    # 4. Create the Individual Student Records (Children)
    for record in request.records:
        new_record = AttendanceRecord(
            session_id=new_session.id,
            student_id=record.student_id,
            status=record.status,
            remarks=record.remarks
        )
        session.add(new_record)

    # 5. Commit everything together safely
    session.commit()

    return AttendanceSubmitResponse(
        message=f"Attendance for {db_class.name} successfully submitted!",
        session_id=new_session.id,
        records_processed=len(request.records)
    )


from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, func
from datetime import datetime, date, timezone
from typing import Optional


@router.get("/classes/summary", response_model=DailyAttendanceSummaryResponse, dependencies=[Depends(allow_staff_only)])
def get_daily_attendance_summary(
    target_date: Optional[date] = Query(None, alias="date", description="Format: YYYY-MM-DD. Defaults to today."),
    session: Session = Depends(get_session)
):
    """Returns a highly optimized daily attendance summary for all classes."""
    
    # 1. Default to today if no date is provided
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    # 2. Fetch all classes and their Form Teachers in ONE query
    # Doing a left outer join in case a class has no form teacher yet
    classes_query = select(Class, TeacherProfile).join(
        TeacherProfile, Class.form_teacher_id == TeacherProfile.id, isouter=True
    )
    class_results = session.exec(classes_query).all()

    # 3. Fetch student counts grouped by class in ONE query
    # Assuming StudentProfile uses class_name to link (based on your current onboarding code)
    student_counts_query = select(StudentProfile.class_name, func.count(StudentProfile.id)).group_by(StudentProfile.class_name)
    student_counts = dict(session.exec(student_counts_query).all()) # e.g., {"JSS 1": 35, "SS 1": 40}

    # 4. Fetch today's Attendance Sessions for ALL classes in ONE query
    sessions_query = select(AttendanceSession).where(AttendanceSession.attendance_date == target_date)
    today_sessions = {s.class_id: s for s in session.exec(sessions_query).all()}

    # 5. Fetch all Attendance Records for today's sessions in ONE query
    session_ids = [s.id for s in today_sessions.values()]
    records_stats = {}
    if session_ids:
        # Group records by session_id and status
        records_query = select(
            AttendanceRecord.session_id, 
            AttendanceRecord.status, 
            func.count(AttendanceRecord.id)
        ).where(AttendanceRecord.session_id.in_(session_ids)).group_by(AttendanceRecord.session_id, AttendanceRecord.status)
        
        for s_id, status, count in session.exec(records_query).all():
            if s_id not in records_stats:
                records_stats[s_id] = {"PRESENT": 0, "ABSENT": 0, "LATE": 0}
            records_stats[s_id][status.value] = count

    # 6. Stitch it all together in memory (Blazing fast!)
    summary_list = []
    
    for cls, teacher in class_results:
        # Get total students for this specific class
        total_students = student_counts.get(cls.name, 0)
        
        # Form Teacher formatting
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unassigned"
        
        # Check if attendance was taken today
        att_session = today_sessions.get(cls.id)
        
        if att_session:
            # Attendance WAS submitted
            stats = records_stats.get(att_session.id, {"PRESENT": 0, "ABSENT": 0, "LATE": 0})
            total_present = stats.get(AttendanceStatus.PRESENT.value, 0)
            total_absent = stats.get(AttendanceStatus.ABSENT.value, 0)
            total_late = stats.get(AttendanceStatus.LATE.value, 0)
            status = att_session.status.value
            
            # Calculate Rate (Present + Late count as attended)
            attended = total_present + total_late
            rate = (attended / total_students * 100) if total_students > 0 else 0.0
            
        else:
            # Attendance is PENDING (No session exists yet)
            status = "PENDING"
            total_present = 0
            total_absent = 0
            total_late = 0
            rate = 0.0
            
        summary_list.append(
            ClassAttendanceSummary(
                class_id=cls.id,
                class_name=cls.name,
                form_teacher_name=teacher_name,
                total_students=total_students,
                session_status=status,
                total_present=total_present,
                total_absent=total_absent,
                total_late=total_late,
                attendance_rate_percentage=round(rate, 1)
            )
        )

    return DailyAttendanceSummaryResponse(
        date=target_date,
        classes=summary_list
    )