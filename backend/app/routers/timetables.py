from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List
from uuid import UUID

from backend.app.db.database import get_session

# 👇 1. Import V2 Gatekeeper Auth
from backend.app.core.auth_utils import CurrentContext, require_permission

from backend.app.models import (
    TimetableEntry, SchoolClass, Subject, TeacherProfile, 
    AcademicTerm, TeacherAssignment, AssignmentStatus 
)
from backend.app.schemas.timetable import TimetableEntryCreate, TimetableEntryResponse, BulkTimetableRequest

router = APIRouter(prefix="/timetable", tags=["Timetable Engine"])

# ==========================================
# WRITE ENDPOINTS
# ==========================================

@router.post("/", response_model=TimetableEntryResponse, status_code=status.HTTP_201_CREATED)
def create_timetable_entry(
    request: TimetableEntryCreate, 
    context: CurrentContext = Depends(require_permission("timetable:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Creates a timetable entry with strict overlapping clash detection and Contextual Contract verification."""
    
    # 1. SECURE FETCH: Ensure all referenced entities belong to this specific school
    db_class = session.exec(select(SchoolClass).where(SchoolClass.id == request.class_id, SchoolClass.school_id == context.school_id)).first()
    db_subject = session.exec(select(Subject).where(Subject.id == request.subject_id, Subject.school_id == context.school_id)).first()
    db_teacher = session.exec(select(TeacherProfile).where(TeacherProfile.id == request.teacher_id, TeacherProfile.school_id == context.school_id)).first()
    db_term = session.exec(select(AcademicTerm).where(AcademicTerm.id == request.term_id, AcademicTerm.school_id == context.school_id)).first()
    
    if not all([db_class, db_subject, db_teacher, db_term]):
        raise HTTPException(status_code=400, detail="Invalid Class, Subject, Teacher, or Term ID provided for your school.")

    # 2. 🛡️ CONTEXTUAL CONTRACT VERIFICATION (The V2 Superpower!)
    # Ensure this teacher is actually assigned to teach this subject to this class in this term
    assignment_contract = session.exec(
        select(TeacherAssignment).where(
            TeacherAssignment.school_id == context.school_id,
            TeacherAssignment.teacher_id == request.teacher_id,
            TeacherAssignment.class_id == request.class_id,
            TeacherAssignment.subject_id == request.subject_id,
            TeacherAssignment.term_id == request.term_id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE
        )
    ).first()

    if not assignment_contract:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Cannot schedule: {db_teacher.last_name} is not actively assigned to teach {db_subject.name} to {db_class.name} this term."
        )

    # 3. CLASS CLASH DETECTION (Isolated to Tenant)
    class_clash = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.school_id == context.school_id) # 👈 Tenant Isolation
        .where(TimetableEntry.term_id == request.term_id) 
        .where(TimetableEntry.day_of_week == request.day_of_week)
        .where(TimetableEntry.class_id == request.class_id)
        .where(TimetableEntry.start_time < request.end_time)
        .where(TimetableEntry.end_time > request.start_time)
    ).first()

    if class_clash:
        # Assuming db_term has a name attribute or enum you access via .name or .name.value
        raise HTTPException(status_code=409, detail=f"{db_class.name} already has a lesson scheduled during this time slot.")

    # 4. TEACHER CLASH DETECTION (Isolated to Tenant)
    teacher_clash = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.school_id == context.school_id) # 👈 Tenant Isolation
        .where(TimetableEntry.term_id == request.term_id) 
        .where(TimetableEntry.day_of_week == request.day_of_week)
        .where(TimetableEntry.teacher_id == request.teacher_id)
        .where(TimetableEntry.start_time < request.end_time)
        .where(TimetableEntry.end_time > request.start_time)
    ).first()

    if teacher_clash:
        raise HTTPException(status_code=409, detail=f"Teacher {db_teacher.last_name} is already teaching another class during this time slot.")

    # 5. Build and Save the Entry
    # Automatically injecting the school_id and session_id into the new entry
    entry = TimetableEntry(
        **request.model_dump(),
        school_id=context.school_id, 
        session_id=assignment_contract.session_id # Pulled perfectly from the active contract!
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    return TimetableEntryResponse(
        id=entry.id,
        term_id=entry.term_id,         
        term_name=db_term.name if isinstance(db_term.name, str) else db_term.name.value,  
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

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def create_bulk_timetable(
    request: BulkTimetableRequest, 
    context: CurrentContext = Depends(require_permission("timetable:write")),
    session: Session = Depends(get_session)
):
    """Mega-Payload Save: Replaces timetable entries for all classes included in the request."""
    
    # 1. Fetch and Verify the Term
    db_term = session.exec(
        select(AcademicTerm).where(AcademicTerm.id == request.term_id, AcademicTerm.school_id == context.school_id)
    ).first()
    
    if not db_term:
        raise HTTPException(status_code=404, detail="Academic Term not found in your school.")

    term_name_val = db_term.name if isinstance(db_term.name, str) else db_term.name.value

    # 2. Extract and verify unique class IDs from the payload
    unique_class_ids = list(set([entry.class_id for entry in request.entries]))
    if not unique_class_ids:
        return {"message": "No entries provided."}

    valid_classes = session.exec(
        select(SchoolClass).where(SchoolClass.id.in_(unique_class_ids), SchoolClass.school_id == context.school_id)
    ).all()
    
    if len(valid_classes) != len(unique_class_ids):
        raise HTTPException(status_code=400, detail="One or more classes do not exist in your school.")
        
    class_name_map = {c.id: c.name for c in valid_classes}

    # 3. Retire existing entries for THESE specific classes in THIS term
    existing_entries = session.exec(
        select(TimetableEntry)
        .where(TimetableEntry.school_id == context.school_id)
        .where(TimetableEntry.term_id == request.term_id) 
        .where(TimetableEntry.class_id.in_(unique_class_ids)) 
    ).all()
    
    for old_entry in existing_entries:
        session.delete(old_entry)
        
    session.flush() 

    new_records = []
    
    # 4. Process the Mega-Payload
    for entry_data in request.entries:
        class_name = class_name_map.get(entry_data.class_id, "Unknown Class")
        day_val = entry_data.day_of_week.value if hasattr(entry_data.day_of_week, 'value') else entry_data.day_of_week
        
        # 🛡️ CONTEXTUAL CONTRACT VERIFICATION
        assignment_contract = session.exec(
            select(TeacherAssignment).where(
                TeacherAssignment.school_id == context.school_id,
                TeacherAssignment.teacher_id == entry_data.teacher_id,
                TeacherAssignment.class_id == entry_data.class_id,
                TeacherAssignment.subject_id == entry_data.subject_id,
                TeacherAssignment.term_id == request.term_id,
                TeacherAssignment.status == AssignmentStatus.ACTIVE
            )
        ).first()

        if not assignment_contract:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Cannot schedule: Teacher is not actively assigned to teach this subject to {class_name}."
            )

        # 🧠 TEACHER CLASH DETECTION (Across the entire school)
        teacher_clash = session.exec(
            select(TimetableEntry)
            .where(TimetableEntry.school_id == context.school_id)
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
                    "class_name": class_name,
                    "day_of_week": day_val,
                    "start_time": entry_data.start_time.strftime("%H:%M:%S"),
                    "message": f"Clash in {class_name}! Teacher is already scheduled during this time."
                }
            )
            
        # Internal Overlap Detection (Same class, same time)
        for saved_record in new_records:
            if (saved_record.class_id == entry_data.class_id and
                saved_record.day_of_week == entry_data.day_of_week and
                saved_record.start_time < entry_data.end_time and
                saved_record.end_time > entry_data.start_time):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error_type": "INTERNAL_OVERLAP",
                        "class_name": class_name,
                        "day_of_week": day_val,
                        "start_time": entry_data.start_time.strftime("%H:%M:%S"),
                        "message": f"Overlap in {class_name}: Two subjects placed in the same time slot."
                    }
                )

        # Insert
        new_entry = TimetableEntry(
            school_id=context.school_id,             
            session_id=assignment_contract.session_id, 
            term_id=request.term_id,
            class_id=entry_data.class_id,
            subject_id=entry_data.subject_id,
            teacher_id=entry_data.teacher_id,
            day_of_week=entry_data.day_of_week,
            start_time=entry_data.start_time,
            end_time=entry_data.end_time
        )
        session.add(new_entry)
        new_records.append(new_entry)

    session.commit()
    
    return {"message": f"Successfully saved {len(new_records)} timetable entries across {len(unique_class_ids)} classes for {term_name_val}."}


# ==========================================
# READ ENDPOINTS (Strictly filtered by term & tenant)
# ==========================================

@router.get("/class/{class_id}", response_model=List[TimetableEntryResponse])
def get_class_timetable(
    class_id: UUID, 
    term_id: UUID = Query(..., description="The ID of the Academic Term"), 
    context: CurrentContext = Depends(require_permission("timetable:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetches the full weekly timetable for a specific class for a given term, isolated to the tenant."""
    
    # 1. 🛡️ VERIFY OWNERSHIP: Ensure the requested class belongs to this school
    db_class = session.exec(
        select(SchoolClass).where(SchoolClass.id == class_id, SchoolClass.school_id == context.school_id)
    ).first()
    
    if not db_class:
        raise HTTPException(status_code=404, detail="Class not found in your school.")

    # 2. SECURE FETCH: Run the join query locked to the tenant
    statement = (
        select(TimetableEntry, SchoolClass, Subject, TeacherProfile, AcademicTerm) 
        .join(SchoolClass, TimetableEntry.class_id == SchoolClass.id)
        .join(Subject, TimetableEntry.subject_id == Subject.id)
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id)
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id)
        .where(TimetableEntry.class_id == class_id)
        .where(TimetableEntry.term_id == term_id) 
        .where(TimetableEntry.school_id == context.school_id) # 👈 Tenant Isolation
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       
            # Handle enum or string dynamically
            term_name=term.name if isinstance(term.name, str) else term.name.value,  
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=teacher.id, 
            teacher_name=f"{teacher.first_name} {teacher.last_name}"
        ) for entry, cls, sub, teacher, term in results 
    ]

# ==========================================
# TEACHER SCHEDULE ENDPOINT
# ==========================================

@router.get("/my-schedule", response_model=List[TimetableEntryResponse])
def get_teacher_schedule(
    term_id: UUID = Query(..., description="The ID of the Academic Term"), 
    context: CurrentContext = Depends(require_permission("timetable:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetches the personal weekly timetable for the logged-in teacher for a given term, isolated to the tenant."""
    
    # 1. SECURE FETCH: Ensure the teacher profile matches the authenticated user AND belongs to this school
    teacher = session.exec(
        select(TeacherProfile).where(
            TeacherProfile.user_id == context.user_id,
            TeacherProfile.school_id == context.school_id # 👈 Tenant Isolation
        )
    ).first()
    
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found in your school.")
        
    # 2. SECURE QUERY: Join the timetable engine, explicitly locked to the school_id
    statement = (
        select(TimetableEntry, SchoolClass, Subject, TeacherProfile, AcademicTerm)
        .join(SchoolClass, TimetableEntry.class_id == SchoolClass.id)
        .join(Subject, TimetableEntry.subject_id == Subject.id)
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id)
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id)
        .where(TimetableEntry.teacher_id == teacher.id)
        .where(TimetableEntry.term_id == term_id) 
        .where(TimetableEntry.school_id == context.school_id) # 👈 Tenant Isolation
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       
            # Safely handle if the frontend enum changed to a string
            term_name=term.name if isinstance(term.name, str) else term.name.value,  
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=t.id, 
            teacher_name=f"{t.first_name} {t.last_name}"
        ) for entry, cls, sub, t, term in results
    ]


# ==========================================
# STUDENT SCHEDULE ENDPOINT
# ==========================================

from backend.app.models import StudentEnrollment, EnrollmentStatus, ParentProfile, ParentStudentLink, Role
from backend.app.services.parent_relationship_service import (
    get_current_parent_profile,
    verify_parent_child_access,
)

@router.get("/student/{student_id}", response_model=List[TimetableEntryResponse])
def get_student_schedule(
    student_id: UUID,
    term_id: UUID = Query(..., description="The ID of the Academic Term"), 
    context: CurrentContext = Depends(require_permission("timetable:read")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Fetches the timetable for a specific student dynamically using their active term enrollment."""
    
    # 1. SECURE FETCH: Ensure the student exists in this tenant
    student = session.exec(
        select(StudentProfile).where(
            StudentProfile.id == student_id,
            StudentProfile.school_id == context.school_id
        )
    ).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your school.")
        
    # 2. DYNAMIC AUTHORIZATION (Parent & Student Boundaries)
    # Check if the caller is a parent by looking for a ParentProfile in this tenant
    role = session.get(Role, context.role_id)
    role_is_parent = bool(role and role.name.lower() == "parent")
    parent_profile = get_current_parent_profile(context, session) if role_is_parent else None

    if parent_profile:
        # 🛠️ FIXED: Compare against parent_profile.id, NOT context.user_id!
        verify_parent_child_access(
            parent_profile.id,
            student_id,
            context.school_id,
            session,
        )
    else:
        # If they aren't a parent, check if they are a student trying to view someone else's timetable
        student_profile_for_user = session.exec(
            select(StudentProfile).where(
                StudentProfile.user_id == context.user_id,
                StudentProfile.school_id == context.school_id,
            )
        ).first()
        
        if student_profile_for_user and student_profile_for_user.id != student_id:
            raise HTTPException(status_code=403, detail="Students can only view their own timetable.")

    # 3. DYNAMIC ENROLLMENT FETCH (The V2 Fix!)
    # We find the exact class the student is enrolled in for this specific term_id
    enrollment = session.exec(
        select(StudentEnrollment).where(
            StudentEnrollment.student_id == student.id,
            StudentEnrollment.school_id == context.school_id,
            StudentEnrollment.term_id == term_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE
        )
    ).first()

    if not enrollment:
        # If they aren't enrolled in a class for this term, they just have an empty schedule
        return []

    # 4. SECURE QUERY: Join the timetable engine, explicitly locked to the school_id
    statement = (
        select(TimetableEntry, SchoolClass, Subject, TeacherProfile, AcademicTerm)
        .join(SchoolClass, TimetableEntry.class_id == SchoolClass.id)
        .join(Subject, TimetableEntry.subject_id == Subject.id)
        .join(TeacherProfile, TimetableEntry.teacher_id == TeacherProfile.id)
        .join(AcademicTerm, TimetableEntry.term_id == AcademicTerm.id)
        .where(TimetableEntry.class_id == enrollment.class_id) # 👈 Using the dynamically resolved class_id
        .where(TimetableEntry.term_id == term_id) 
        .where(TimetableEntry.school_id == context.school_id) # 👈 Tenant Isolation
        .order_by(TimetableEntry.day_of_week, TimetableEntry.start_time)
    )
    
    results = session.exec(statement).all()
    
    return [
        TimetableEntryResponse(
            id=entry.id, 
            term_id=entry.term_id,       
            term_name=term.name if isinstance(term.name, str) else term.name.value,  
            day_of_week=entry.day_of_week, 
            start_time=entry.start_time, 
            end_time=entry.end_time,
            class_id=cls.id, 
            class_name=cls.name, 
            subject_id=sub.id, 
            subject_name=sub.name,
            teacher_id=t.id, 
            teacher_name=f"{t.first_name} {t.last_name}"
        ) for entry, cls, sub, t, term in results 
    ]
