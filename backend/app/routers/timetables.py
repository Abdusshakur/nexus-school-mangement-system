from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from backend.app.db.database import get_session
from backend.app.core.auth_utils import RoleChecker, get_current_token_payload
from backend.app.models import TimetableEntry, Class, Subject, TeacherProfile, UserRole, StudentProfile, ParentStudentLink, AcademicTerm
from backend.app.schemas.timetable import TimetableEntryCreate, TimetableEntryResponse, BulkTimetableRequest

router = APIRouter(prefix="/timetable", tags=["Timetable Engine"])

# ==========================================
# PERMISSION CHECKERS
# ==========================================
allow_admin_only = RoleChecker(["admin"])
allow_teacher_only = RoleChecker(["teacher"])
allow_parent_student_admin = RoleChecker(["parent", "student", "admin"])

# ==========================================
# WRITE ENDPOINTS
# ==========================================

@router.post("/", response_model=TimetableEntryResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_timetable_entry(request: TimetableEntryCreate, session: Session = Depends(get_session)):
    """Creates a timetable entry with strict overlapping clash detection."""
    
    db_class = session.get(Class, request.class_id)
    db_subject = session.get(Subject, request.subject_id)
    db_teacher = session.get(TeacherProfile, request.teacher_id)
    
    # 1. 🆕 Fetch the term to ensure it exists and to get its name for the UI
    db_term = session.get(AcademicTerm, request.term_id) 
    
    if not all([db_class, db_subject, db_teacher, db_term]):
        raise HTTPException(status_code=400, detail="Invalid Class, Subject, Teacher, or Term ID provided.")

    # 2. CLASS CLASH DETECTION (Now respects term_id)
    class_clash = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.term_id == request.term_id) # 👈 Updated!
        .where(TimetableEntry.day_of_week == request.day_of_week)
        .where(TimetableEntry.class_id == request.class_id)
        .where(TimetableEntry.start_time < request.end_time)
        .where(TimetableEntry.end_time > request.start_time)
    ).first()

    if class_clash:
        # 🆕 Using db_term.name.value provides a beautiful error like "...in First Term."
        raise HTTPException(status_code=409, detail=f"{db_class.name} already has a lesson scheduled during this time slot in {db_term.name.value}.")

    # 3. TEACHER CLASH DETECTION (Now respects term_id)
    teacher_clash = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.term_id == request.term_id) # 👈 Updated!
        .where(TimetableEntry.day_of_week == request.day_of_week)
        .where(TimetableEntry.teacher_id == request.teacher_id)
        .where(TimetableEntry.start_time < request.end_time)
        .where(TimetableEntry.end_time > request.start_time)
    ).first()

    if teacher_clash:
        raise HTTPException(status_code=409, detail=f"Teacher {db_teacher.last_name} is already teaching another class during this time slot in {db_term.name.value}.")

    entry = TimetableEntry(**request.model_dump())
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    return TimetableEntryResponse(
        id=entry.id,
        term_id=entry.term_id,           # 👈 Updated!
        term_name=db_term.name.value,    # 👈 Added for the frontend UI!
        day_of_week=entry.day_of_week,
        start_time=entry.start_time,
        end_time=entry.end_time,
        class_id=db_class.id,
        class_name=db_class.name,
        subject_id=db_subject.id,
        subject_name=db_subject.name,
        teacher_id=db_teacher.id,
        teacher_name=f"{db_teacher.first_name} {db_teacher.last_name}"
    )
@router.post("/bulk", status_code=status.HTTP_201_CREATED, dependencies=[Depends(allow_admin_only)])
def create_bulk_timetable(request: BulkTimetableRequest, session: Session = Depends(get_session)):
    """Saves a full grid of timetable entries at once. Returns exact coordinates if a clash fails the save."""
    
    # 1. 🆕 Fetch the term to ensure it exists and get its name
    db_term = session.get(AcademicTerm, request.term_id)
    if not db_term:
        raise HTTPException(status_code=404, detail="Academic Term not found.")

    # 2. 🔄 Updated to use term_id
    existing_entries = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.class_id == request.class_id)
        .where(TimetableEntry.term_id == request.term_id) 
    ).all()
    
    for old_entry in existing_entries:
        session.delete(old_entry)
        
    session.flush() 

    new_records = []
    
    for entry_data in request.entries:
        # 3. 🔄 Updated to use term_id
        teacher_clash = session.exec(
            select(TimetableEntry)
            .where(TimetableEntry.term_id == request.term_id) 
            .where(TimetableEntry.day_of_week == entry_data.day_of_week)
            .where(TimetableEntry.teacher_id == entry_data.teacher_id)
            .where(TimetableEntry.start_time < entry_data.end_time)
            .where(TimetableEntry.end_time > entry_data.start_time)
        ).first()

        if teacher_clash:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, 
                detail={
                    "error_type": "TEACHER_CLASH",
                    "day_of_week": entry_data.day_of_week.value,
                    "start_time": entry_data.start_time.strftime("%H:%M:%S"),
                    "end_time": entry_data.end_time.strftime("%H:%M:%S"),
                    "teacher_id": str(entry_data.teacher_id),
                    # 🆕 Added the term name for better error context
                    "message": f"Clash detected! This teacher is already teaching another class during this time in {db_term.name.value}."
                }
            )
            
        for saved_record in new_records:
            if (saved_record.day_of_week == entry_data.day_of_week and
                saved_record.start_time < entry_data.end_time and
                saved_record.end_time > entry_data.start_time):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error_type": "INTERNAL_OVERLAP",
                        "day_of_week": entry_data.day_of_week.value,
                        "start_time": entry_data.start_time.strftime("%H:%M:%S"),
                        "message": "You have placed two overlapping subjects in the same time slot."
                    }
                )

        # 4. 🔄 Updated to use term_id instead of academic_term
        new_entry = TimetableEntry(
            term_id=request.term_id,
            class_id=request.class_id,
            subject_id=entry_data.subject_id,
            teacher_id=entry_data.teacher_id,
            day_of_week=entry_data.day_of_week,
            start_time=entry_data.start_time,
            end_time=entry_data.end_time
        )
        session.add(new_entry)
        new_records.append(new_entry)

    session.commit()
    
    # 🆕 Using db_term.name.value for a dynamic, accurate response message
    return {"message": f"Successfully saved {len(new_records)} timetable entries for {db_term.name.value}."}

# ==========================================
# READ ENDPOINTS (Now strictly filtered by term)
# ==========================================

@router.get("/class/{class_id}", response_model=List[TimetableEntryResponse], dependencies=[Depends(allow_admin_only)])
def get_class_timetable(
    class_id: UUID, 
    term_id: UUID = Query(..., description="The ID of the Academic Term"), # 👈 Updated!
    session: Session = Depends(get_session)
):
    """Fetches the full weekly timetable for a specific class for a given term."""
    statement = (
        # 🆕 Added AcademicTerm to the select statement
        select(TimetableEntry, Class, Subject, TeacherProfile, AcademicTerm) 
        .join(Class, TimetableEntry.class_id == Class.id) # type: ignore
        .join(Subject, TimetableEntry.subject_id == Subject.id) # type: ignore
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id) # type: ignore
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id) # 👈 type: ignore
        .where(TimetableEntry.class_id == class_id)
        .where(TimetableEntry.term_id == term_id) # 👈 Updated!
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       # 👈 Updated!
            term_name=term.name.value,   # 👈 Added term name for the UI!
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=teacher.id, 
            teacher_name=f"{teacher.first_name} {teacher.last_name}"
        ) for entry, cls, sub, teacher, term in results # 👈 Added 'term' to the tuple unpack
    ]

@router.get("/my-schedule", response_model=List[TimetableEntryResponse])
def get_teacher_schedule(
    term_id: UUID = Query(..., description="The ID of the Academic Term"), # 👈 Updated parameter
    session: Session = Depends(get_session),
    payload: dict = Depends(allow_teacher_only)
):
    """Fetches the personal weekly timetable for the logged-in teacher for a given term."""
    user_id = UUID(payload.get("user_id"))
    teacher = session.exec(select(TeacherProfile).where(TeacherProfile.user_id == user_id)).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found.")
        
    statement = (
        # 🆕 Added AcademicTerm to the select statement
        select(TimetableEntry, Class, Subject, TeacherProfile, AcademicTerm)
        .join(Class, TimetableEntry.class_id == Class.id) # type: ignore
        .join(Subject, TimetableEntry.subject_id == Subject.id) # type: ignore
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id) # type: ignore
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id) # 👈 type: ignore
        .where(TimetableEntry.teacher_id == teacher.id)
        .where(TimetableEntry.term_id == term_id) # 👈 Updated filter
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       # 👈 Updated!
            term_name=term.name.value,   # 👈 Added term name!
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=t.id, 
            teacher_name=f"{t.first_name} {t.last_name}"
        ) for entry, cls, sub, t, term in results # 👈 Added 'term' to the tuple unpack
    ]


@router.get("/student/{student_id}", response_model=List[TimetableEntryResponse])
def get_student_schedule(
    student_id: UUID,
    term_id: UUID = Query(..., description="The ID of the Academic Term"), # 👈 Updated parameter
    session: Session = Depends(get_session),
    payload: dict = Depends(allow_parent_student_admin)
):
    """Fetches the timetable for a specific student's class for a given term."""
    user_id = UUID(payload.get("user_id"))
    user_role = payload.get("role")
    
    student = session.exec(select(StudentProfile).where(StudentProfile.id == student_id)).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")
        
    if user_role == UserRole.PARENT.value:
        valid_link = session.exec(
            select(ParentStudentLink)
            .where(ParentStudentLink.parent_id == user_id)
            .where(ParentStudentLink.student_id == student_id)
        ).first()
        if not valid_link:
            raise HTTPException(status_code=403, detail="You do not have permission to view this student's timetable.")

    db_class = session.exec(select(Class).where(Class.name == student.class_name)).first()
    if not db_class:
        raise HTTPException(status_code=404, detail="Student's class configuration not found.")

    statement = (
        # 🆕 Added AcademicTerm to the select statement
        select(TimetableEntry, Class, Subject, TeacherProfile, AcademicTerm)
        .join(Class, TimetableEntry.class_id == Class.id) # type: ignore
        .join(Subject, TimetableEntry.subject_id == Subject.id) # type: ignore
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id) # type: ignore
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id) # 👈 type: ignore
        .where(TimetableEntry.class_id == db_class.id)
        .where(TimetableEntry.term_id == term_id) # 👈 Updated filter
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       # 👈 Updated!
            term_name=term.name.value,   # 👈 Added term name!
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=t.id, 
            teacher_name=f"{t.first_name} {t.last_name}"
        ) for entry, cls, sub, t, term in results # 👈 Added 'term' to the tuple unpack
    ]