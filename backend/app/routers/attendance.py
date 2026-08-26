# backend/app/routers/attendance.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func
from datetime import datetime, date, timezone
from typing import Optional
from uuid import UUID

from backend.app.db.database import get_session
from backend.app.schemas.attendance import ( 
    AttendanceSubmitRequest, AttendanceSubmitResponse, 
    DailyAttendanceSummaryResponse, ClassAttendanceSummary, AttendanceStatus
)
# 👇 1. Import the V2 Gatekeeper
from backend.app.core.auth_utils import CurrentContext, require_permission

from backend.app.models import (
    Class, TeacherProfile, StudentProfile, 
    AttendanceSession, AttendanceRecord, SessionStatus, AcademicSession, AcademicTerm, StudentEnrollment, EnrollmentStatus
)


router = APIRouter(
    prefix="/attendance",
    tags=["Attendance Management"]
)

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AttendanceSubmitResponse)
def submit_class_attendance(
    request: AttendanceSubmitRequest, 
    # 👇 2. Gatekeeper secures the endpoint and provides the school_id
    context: CurrentContext = Depends(require_permission("attendance:write")),
    session: Session = Depends(get_session)
):
    """Creates a locked daily attendance session bound to a specific academic term and records all students."""
    
    # 1. SECURE FETCH: Verify the class exists AND belongs to this active school
    db_class = session.exec(
        select(Class).where(Class.id == request.class_id, Class.school_id == context.school_id)
    ).first()
    
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found or access denied.")

    # 2. ENFORCE THE RULE: Only one session per class, per day, per school!
    existing_session = session.exec(
        select(AttendanceSession)
        .where(
            AttendanceSession.class_id == request.class_id,
            AttendanceSession.attendance_date == request.attendance_date,
            AttendanceSession.school_id == context.school_id # 👈 Tenant Isolation
        )
    ).first()

    if existing_session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Attendance for {db_class.name} on {request.attendance_date} has already been submitted."
        )

    # 3. Create the Master Session (Parent) with Temporal Anchors!
    new_session = AttendanceSession(
        school_id=context.school_id,                     # 👈 Tenant anchor
        session_id=request.academic_session_id,          # 👈 Temporal anchor (Year)
        term_id=request.academic_term_id,                # 👈 Temporal anchor (Term)
        class_id=request.class_id,
        attendance_date=request.attendance_date,
        status=SessionStatus.SUBMITTED,
        recorded_by_id=context.user_id                   # 👈 Track who actually submitted it
    )
    
    session.add(new_session)
    session.flush() # Flushes to DB immediately so we can get new_session.id

    # 4. Create the Individual Student Records (Children)
    # (Note: In a highly strict system, we could query StudentEnrollment here to ensure 
    # every student_id is actually enrolled in this class_id for this term_id)
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



@router.get("/classes/summary", response_model=DailyAttendanceSummaryResponse)
def get_daily_attendance_summary(
    target_date: Optional[date] = Query(None, alias="date", description="Format: YYYY-MM-DD. Defaults to today."),
    academic_session_id: Optional[UUID] = Query(None, description="Optional: specific year ID"),
    academic_term_id: Optional[UUID] = Query(None, description="Optional: specific term ID"),
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session)
):
    """Returns a highly optimized, tenant-isolated daily attendance summary using Contextual Enrollments."""
    
    if not target_date:
        target_date = datetime.now(timezone.utc).date()

    # 1. Resolve Temporal Anchors (Graceful fallback to the school's current active term)
    if not academic_session_id or not academic_term_id:
        current_session = session.exec(
            select(AcademicSession).where(
                AcademicSession.school_id == context.school_id, AcademicSession.is_current == True
            )
        ).first()
        current_term = session.exec(
            select(AcademicTerm).where(
                AcademicTerm.school_id == context.school_id, AcademicTerm.is_current == True
            )
        ).first()
        
        if not current_session or not current_term:
            raise HTTPException(
                status_code=400, 
                detail="No active academic session/term found. Please provide them in the query or configure your calendar."
            )
        
        academic_session_id = academic_session_id or current_session.id
        academic_term_id = academic_term_id or current_term.id

    # 2. Fetch classes & Form Teachers scoped strictly to this Tenant
    classes_query = (
        select(Class, TeacherProfile)
        .join(TeacherProfile, Class.form_teacher_id == TeacherProfile.id, isouter=True)
        .where(Class.school_id == context.school_id)
    )
    class_results = session.exec(classes_query).all()

    # 3. Fetch student counts using the NEW Contextual Enrollment table!
    student_counts_query = (
        select(StudentEnrollment.class_id, func.count(StudentEnrollment.id))
        .where(
            StudentEnrollment.school_id == context.school_id,
            StudentEnrollment.session_id == academic_session_id,
            StudentEnrollment.term_id == academic_term_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE
        )
        .group_by(StudentEnrollment.class_id)
    )
    student_counts = dict(session.exec(student_counts_query).all()) # Returns mapping like {class_id: 35}

    # 4. Fetch Attendance Sessions anchored to Time and Tenant
    sessions_query = select(AttendanceSession).where(
        AttendanceSession.school_id == context.school_id,
        AttendanceSession.session_id == academic_session_id,
        AttendanceSession.term_id == academic_term_id,
        AttendanceSession.attendance_date == target_date
    )
    today_sessions = {s.class_id: s for s in session.exec(sessions_query).all()}

    # 5. Fetch all Attendance Records for today's sessions in ONE query
    session_ids = [s.id for s in today_sessions.values()]
    records_stats = {}
    if session_ids:
        records_query = select(
            AttendanceRecord.session_id, 
            AttendanceRecord.status, 
            func.count(AttendanceRecord.id)
        ).where(AttendanceRecord.session_id.in_(session_ids)).group_by(AttendanceRecord.session_id, AttendanceRecord.status)
        
        for s_id, status, count in session.exec(records_query).all():
            if s_id not in records_stats:
                records_stats[s_id] = {"PRESENT": 0, "ABSENT": 0, "LATE": 0}
            records_stats[s_id][status.value] = count

    # 6. Stitch it all together in memory
    summary_list = []
    for cls, teacher in class_results:
        # Get total students for this specific class using the actual UUID
        total_students = student_counts.get(cls.id, 0)
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "Unassigned"
        att_session = today_sessions.get(cls.id)
        
        if att_session:
            stats = records_stats.get(att_session.id, {"PRESENT": 0, "ABSENT": 0, "LATE": 0})
            total_present = stats.get(AttendanceStatus.PRESENT.value, 0)
            total_absent = stats.get(AttendanceStatus.ABSENT.value, 0)
            total_late = stats.get(AttendanceStatus.LATE.value, 0)
            status_val = att_session.status.value
            
            attended = total_present + total_late
            rate = (attended / total_students * 100) if total_students > 0 else 0.0
            
        else:
            status_val = "PENDING"
            total_present, total_absent, total_late, rate = 0, 0, 0, 0.0
            
        summary_list.append(
            ClassAttendanceSummary(
                class_id=cls.id,
                class_name=cls.name,
                form_teacher_name=teacher_name,
                total_students=total_students,
                session_status=status_val,
                total_present=total_present,
                total_absent=total_absent,
                total_late=total_late,
                attendance_rate_percentage=round(rate, 1)
            )
        )

    return DailyAttendanceSummaryResponse(
        date=target_date,
        academic_session_id=academic_session_id, # 👈 Send temporal anchors back to the frontend
        academic_term_id=academic_term_id,
        classes=summary_list
    )