# backend/app/routers/attendance.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date, timezone, timedelta

from backend.app.db.database import get_session
from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.models import (
    TeacherProfile, TeacherAssignment, SchoolClass, StudentEnrollment,
    StudentProfile, AttendanceSession, AttendanceRecord, AssignmentStatus,
    EnrollmentStatus, AcademicSession, AcademicTerm, SessionStatus, AttendanceStatus,
    ActivityLog, AttendanceQRSession, TeacherAttendanceSettings
)
from backend.app.schemas.attendance import (
    ClassRosterResponse, AttendanceBatchSubmit, StudentAttendanceItem,
    DailyAttendanceSummaryResponse, ClassAttendanceSummary, AttendanceSubmitResponse,
    AttendanceDecisionRequest, AttendanceWorkflowResponse, QRGenerateRequest, QRGenerateResponse
)
from backend.app.routers.teacher_context import get_current_teacher_profile, get_active_term_and_session

from backend.app.core.qr_utils import generate_secure_qr_token


router = APIRouter(
    prefix="/attendance",
    tags=["Student Attendance Workflow"]
)

# ==========================================
# SECURITY GATEKEEPER
# ==========================================
def verify_teacher_class_access(teacher_id: UUID, class_id: UUID, school_id: UUID, session: Session, active_session_id: UUID, active_term_id: UUID):
    """Validates if a teacher is a form teacher or subject teacher for a given class."""
    school_class = session.exec(
        select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.school_id == school_id)
    ).first()

    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found.")

    if school_class.form_teacher_id == teacher_id:
        return school_class

    assignment = session.exec(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher_id,
            TeacherAssignment.school_id == school_id,
            TeacherAssignment.class_id == class_id,
            TeacherAssignment.session_id == active_session_id,
            TeacherAssignment.term_id == active_term_id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE
        )
    ).first()

    if not assignment:
        raise HTTPException(status_code=403, detail="You are not authorized to manage attendance for this class.")

    return school_class

# ==========================================
# TEACHER WORKFLOW ENDPOINTS
# ==========================================
@router.get("/my-classes", response_model=list[dict])
def get_attendance_classes(
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session)
):
    """Returns a unique list of classes the teacher can take attendance for."""
    teacher, _ = get_current_teacher_profile(context, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    assignments = session.exec(
        select(SchoolClass).join(TeacherAssignment, TeacherAssignment.class_id == SchoolClass.id)
        .where(
            TeacherAssignment.teacher_id == teacher.id,
            TeacherAssignment.school_id == context.school_id,
            TeacherAssignment.session_id == active_session.id,
            TeacherAssignment.term_id == active_term.id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE
        )
    ).all()

    form_classes = session.exec(
        select(SchoolClass).where(
            SchoolClass.form_teacher_id == teacher.id,
            SchoolClass.school_id == context.school_id,
        )
    ).all()

    unique_classes = {cls.id: cls for cls in (assignments + form_classes)}
    return [{"id": cls.id, "name": cls.name} for cls in unique_classes.values()]


@router.get("/classes/{class_id}/students", response_model=ClassRosterResponse)
def get_class_roster_for_attendance(
    class_id: UUID,
    target_date: date = Query(..., alias="date"),
    context: CurrentContext = Depends(require_permission("attendance:read")),
    session: Session = Depends(get_session)
):
    """Return a school-scoped roster for teachers and attendance reviewers."""
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    school_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.school_id == context.school_id,
        )
    ).first()
    if not school_class:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")

    # Teachers may only review classes assigned to them. Other users with
    # attendance:read, such as admins, may review any class in their school.
    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.user_id == context.user_id,
            TeacherProfile.school_id == context.school_id,
        )
    ).first()
    if teacher:
        school_class = verify_teacher_class_access(
            teacher.id,
            class_id,
            context.school_id,
            session,
            active_session.id,
            active_term.id,
        )

    att_session = session.exec(
        select(AttendanceSession).where(
            AttendanceSession.class_id == class_id,
            AttendanceSession.school_id == context.school_id,
            AttendanceSession.session_id == active_session.id,
            AttendanceSession.term_id == active_term.id,
            AttendanceSession.attendance_date == target_date,
        )
    ).first()

    enrollments = session.exec(
        select(StudentProfile)
        .join(StudentEnrollment, StudentEnrollment.student_id == StudentProfile.id)
        .where(
            StudentEnrollment.class_id == class_id,
            StudentEnrollment.school_id == context.school_id,
            StudentEnrollment.session_id == active_session.id,
            StudentEnrollment.term_id == active_term.id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            StudentProfile.school_id == context.school_id,
        )
    ).all()

    attendance_map = {}
    if att_session:
        # Assuming foreign key is session_id on AttendanceRecord based on your first block
        records = session.exec(select(AttendanceRecord).where(AttendanceRecord.session_id == att_session.id)).all()
        attendance_map = {r.student_id: r for r in records}

    students_list = []
    for student in enrollments:
        record = attendance_map.get(student.id)
        students_list.append(
            StudentAttendanceItem(
                student_id=student.id,
                admission_number=student.admission_number,
                first_name=student.first_name,
                last_name=student.last_name,
                status=record.status if record else None,
                remarks=record.remarks if record else None
            )
        )

    return ClassRosterResponse(
        class_id=class_id,
        class_name=school_class.name,
        date=target_date,
        attendance_session_id=att_session.id if att_session else None,
        attendance_status=att_session.status if att_session else None,
        students=students_list
    )


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AttendanceSubmitResponse)
def submit_class_attendance(
    payload: AttendanceBatchSubmit,
    context: CurrentContext = Depends(require_permission("attendance:write")),
    session: Session = Depends(get_session)
):
    """Submits or updates attendance records (UPSERT) safely."""
    teacher, teacher_user = get_current_teacher_profile(context, session)
    active_session, active_term = get_active_term_and_session(context.school_id, session)

    verify_teacher_class_access(teacher.id, payload.class_id, context.school_id, session, active_session.id, active_term.id)

    enrolled_student_ids = set(
        session.exec(
            select(StudentEnrollment.student_id).where(
                StudentEnrollment.school_id == context.school_id,
                StudentEnrollment.class_id == payload.class_id,
                StudentEnrollment.session_id == active_session.id,
                StudentEnrollment.term_id == active_term.id,
                StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            )
        ).all()
    )
    submitted_student_ids = [item.student_id for item in payload.records]
    if len(submitted_student_ids) != len(set(submitted_student_ids)):
        raise HTTPException(status_code=400, detail="A student may appear only once per attendance submission.")
    if not set(submitted_student_ids).issubset(enrolled_student_ids):
        raise HTTPException(status_code=400, detail="Attendance can only be submitted for active students in this class.")

    att_session = session.exec(
        select(AttendanceSession).where(
            AttendanceSession.class_id == payload.class_id,
            AttendanceSession.school_id == context.school_id,
            AttendanceSession.attendance_date == payload.date
        )
    ).first()

    if not att_session:
        att_session = AttendanceSession(
            school_id=context.school_id,
            class_id=payload.class_id,
            session_id=active_session.id,
            term_id=active_term.id,
            attendance_date=payload.date,
            status=SessionStatus.SUBMITTED,
            recorded_by_id=teacher_user.id
        )
        session.add(att_session)
        session.flush()
    elif att_session.status == SessionStatus.APPROVED:
        raise HTTPException(status_code=409, detail="Approved attendance cannot be edited.")

    existing_records = session.exec(
        select(AttendanceRecord).where(AttendanceRecord.session_id == att_session.id)
    ).all()
    record_map = {r.student_id: r for r in existing_records}

    for item in payload.records:
        if item.student_id in record_map:
            existing = record_map[item.student_id]
            existing.status = item.status
            existing.remarks = item.remarks
        else:
            new_record = AttendanceRecord(
                session_id=att_session.id,
                student_id=item.student_id,
                status=item.status,
                remarks=item.remarks
            )
            session.add(new_record)

    att_session.status = SessionStatus.SUBMITTED
    att_session.recorded_by_id = teacher_user.id
    att_session.updated_at = datetime.now(timezone.utc)
    session.commit()

    return AttendanceSubmitResponse(
        message="Attendance successfully recorded",
        session_id=att_session.id,
        records_processed=len(payload.records)
    )

# ==========================================
# DASHBOARD SUMMARY ENDPOINT
# ==========================================
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
        select(SchoolClass, TeacherProfile)
        .join(TeacherProfile, SchoolClass.form_teacher_id == TeacherProfile.id, isouter=True)
        .where(SchoolClass.school_id == context.school_id)
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


def get_attendance_session_for_school(
    attendance_session_id: UUID, school_id: UUID, session: Session
) -> AttendanceSession:
    attendance_session = session.exec(
        select(AttendanceSession).where(
            AttendanceSession.id == attendance_session_id,
            AttendanceSession.school_id == school_id,
        )
    ).first()
    if not attendance_session:
        raise HTTPException(status_code=404, detail="Attendance session not found.")
    return attendance_session


def record_attendance_decision(
    attendance_session: AttendanceSession,
    context: CurrentContext,
    session: Session,
    new_status: SessionStatus,
    message: str,
    reason: Optional[str] = None,
) -> AttendanceWorkflowResponse:
    attendance_session.status = new_status
    attendance_session.approved_by_id = context.user_id if new_status == SessionStatus.APPROVED else None
    attendance_session.updated_at = datetime.now(timezone.utc)
    session.add(
        ActivityLog(
            school_id=context.school_id,
            activity_type=f"ATTENDANCE_{new_status.value}",
            message=message if not reason else f"{message}: {reason}",
            performed_by=context.user_id,
        )
    )
    session.commit()
    session.refresh(attendance_session)
    return AttendanceWorkflowResponse(
        message=message,
        session_id=attendance_session.id,
        status=attendance_session.status,
    )


@router.post(
    "/{attendance_session_id}/approve",
    response_model=AttendanceWorkflowResponse,
)
def approve_attendance(
    attendance_session_id: UUID,
    context: CurrentContext = Depends(require_permission("attendance:approve")),
    session: Session = Depends(get_session),
):
    attendance_session = get_attendance_session_for_school(
        attendance_session_id, context.school_id, session
    )
    if attendance_session.status != SessionStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Only submitted attendance can be approved.")
    return record_attendance_decision(
        attendance_session,
        context,
        session,
        SessionStatus.APPROVED,
        "Attendance approved successfully",
    )


@router.post(
    "/{attendance_session_id}/reject",
    response_model=AttendanceWorkflowResponse,
)
def reject_attendance(
    attendance_session_id: UUID,
    payload: AttendanceDecisionRequest,
    context: CurrentContext = Depends(require_permission("attendance:approve")),
    session: Session = Depends(get_session),
):
    attendance_session = get_attendance_session_for_school(
        attendance_session_id, context.school_id, session
    )
    if attendance_session.status != SessionStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Only submitted attendance can be rejected.")
    if not payload.reason or not payload.reason.strip():
        raise HTTPException(status_code=400, detail="A rejection reason is required.")
    return record_attendance_decision(
        attendance_session,
        context,
        session,
        SessionStatus.REJECTED,
        "Attendance rejected",
        payload.reason.strip(),
    )


@router.post(
    "/{attendance_session_id}/reopen",
    response_model=AttendanceWorkflowResponse,
)
def reopen_attendance(
    attendance_session_id: UUID,
    payload: AttendanceDecisionRequest,
    context: CurrentContext = Depends(require_permission("attendance:approve")),
    session: Session = Depends(get_session),
):
    attendance_session = get_attendance_session_for_school(
        attendance_session_id, context.school_id, session
    )
    if attendance_session.status not in {SessionStatus.APPROVED, SessionStatus.REJECTED}:
        raise HTTPException(status_code=409, detail="Only approved or rejected attendance can be reopened.")
    return record_attendance_decision(
        attendance_session,
        context,
        session,
        SessionStatus.DRAFT,
        "Attendance reopened for editing",
        payload.reason.strip() if payload.reason else None,
    )




@router.post("/qr/generate", response_model=QRGenerateResponse)
def generate_attendance_qr(
    payload: QRGenerateRequest,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session)
):
    """Generates a new short-lived QR token and invalidates previous active ones."""
    today = date.today()
    now = datetime.now(timezone.utc)

    # 1. Deactivate any currently active QR codes of this type for today
    active_sessions = session.exec(
        select(AttendanceQRSession).where(
            AttendanceQRSession.school_id == context.school_id,
            AttendanceQRSession.attendance_date == today,
            AttendanceQRSession.qr_type == payload.qr_type,
            AttendanceQRSession.is_active.is_(True)
        )
    ).all()
    
    for active_qr in active_sessions:
        active_qr.is_active = False
        session.add(active_qr)

    # 2. Get QR rotation settings (default to 5 mins if not set)
    settings = session.exec(
        select(TeacherAttendanceSettings).where(TeacherAttendanceSettings.school_id == context.school_id)
    ).first()
    rotation_seconds = settings.qr_rotation_seconds if settings else 300
    
    # 3. Generate Crypto Token
    raw_token, token_hash = generate_secure_qr_token()
    expires_at = now + timedelta(seconds=rotation_seconds)

    # 4. Save to DB
    new_qr_session = AttendanceQRSession(
        school_id=context.school_id,
        attendance_date=today,
        qr_type=payload.qr_type,
        token_hash=token_hash,
        valid_from=now,
        expires_at=expires_at,
        is_active=True
    )
    session.add(new_qr_session)
    session.commit()

    # We return the RAW token to the frontend to render the QR code.
    # It is NEVER returned again by the API after this moment.
    return QRGenerateResponse(
        raw_token=raw_token,
        expires_at=expires_at,
        qr_type=payload.qr_type
    )


