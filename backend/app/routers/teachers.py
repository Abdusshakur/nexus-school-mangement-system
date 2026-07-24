from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, String
from typing import List, Optional
from uuid import UUID


from backend.app.db.database import get_session
from backend.app.models import (
    User, 
    UserRole,
    TeacherProfile, 
    Class, 
    Subject, 
    TeacherClassLink, 
    TeacherSubjectLink
)
from backend.app.schemas.teacher import (
    TeacherCreateRequest,
    TeacherCreateResponse,
    TeacherProfileUpdateRequest,
    TeacherProfileUpdateResponse,
    AssignClassesRequest,
    AssignClassesResponse,
    AssignSubjectsRequest,
    AssignSubjectsResponse,
    TeacherDetailResponse,
    AssignedClassItem,
    AssignedSubjectItem
)
from backend.app.core.auth_utils import RoleChecker, hash_password

router = APIRouter(prefix="/teachers", tags=["Teacher Management"])
allow_admin_only = RoleChecker(["admin"])

# Helper function for aggregating full details (e.g. GET /teachers/{id})
def build_teacher_detail_response(teacher: TeacherProfile, email: str) -> TeacherDetailResponse:
    assigned_classes = [
        AssignedClassItem(id=cls.id, name=cls.name) 
        for cls in teacher.classes
    ]
    assigned_subjects = [
        AssignedSubjectItem(id=sub.id, name=sub.name) 
        for sub in teacher.subjects
    ]
    
    return TeacherDetailResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        email=email,
        phone_number=teacher.phone_number,
        gender=teacher.gender,
        department=teacher.department,
        qualification=teacher.qualification,
        address=teacher.address,
        assigned_classes=assigned_classes,
        assigned_subjects=assigned_subjects,
        created_at=teacher.created_at
    )


# ------------------------------------------------------------------
# STEP 1: Create Base Teacher Profile
# ------------------------------------------------------------------

@router.post(
    "/", 
    response_model=TeacherCreateResponse, 
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(allow_admin_only)]
)
def create_teacher(
    payload: TeacherCreateRequest, 
    session: Session = Depends(get_session)
):
    """
    Step 1: Onboard a teacher profile and create their User account.
    Returns only profile data without requiring class or subject schedules.
    """
    existing_user = session.exec(select(User).where(User.email == payload.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user account with this email address already exists."
        )

    temp_password = "Teacher@Nexus2026"  
    new_user = User(
        email=payload.email,
        password_hash=hash_password(temp_password),
        role=UserRole.TEACHER,
        is_active=True
    )
    session.add(new_user)
    session.flush()

    teacher_profile = TeacherProfile(
        user_id=new_user.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        phone_number=payload.phone_number,
        gender=payload.gender,
        address=payload.address,
        department=payload.department,
        qualification=payload.qualification
    )
    session.add(teacher_profile)
    session.commit()
    session.refresh(teacher_profile)

    return TeacherCreateResponse(
        id=teacher_profile.id,
        user_id=new_user.id,
        first_name=teacher_profile.first_name,
        last_name=teacher_profile.last_name,
        email=new_user.email,
        phone_number=teacher_profile.phone_number,
        gender=teacher_profile.gender,
        department=teacher_profile.department,
        qualification=teacher_profile.qualification,
        address=teacher_profile.address,
        created_at=teacher_profile.created_at
    )


# ------------------------------------------------------------------
# STEP 2A: Assign / Replace Classes
# ------------------------------------------------------------------

@router.put(
    "/{teacher_id}/classes", 
    response_model=AssignClassesResponse,
    dependencies=[Depends(allow_admin_only)]
)
def assign_teacher_classes(
    teacher_id: UUID, 
    payload: AssignClassesRequest, 
    session: Session = Depends(get_session)
):
    """
    Step 2A: Sync class assignments. Replaces existing class links 
    and returns only the updated class roster.
    """
    teacher = session.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found."
        )

    # 1. Clear current class links
    existing_links = session.exec(
        select(TeacherClassLink).where(TeacherClassLink.teacher_id == teacher_id)
    ).all()
    for link in existing_links:
        session.delete(link)
    session.flush()

    # 2. Add new class links
    assigned_items = []
    if payload.class_ids:
        valid_classes = session.exec(
            select(Class).where(Class.id.in_(payload.class_ids))
        ).all()
        
        if len(valid_classes) != len(set(payload.class_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more class IDs provided are invalid."
            )

        for cls in valid_classes:
            session.add(TeacherClassLink(teacher_id=teacher_id, class_id=cls.id))
            assigned_items.append(AssignedClassItem(id=cls.id, name=cls.name))

    session.commit()

    return AssignClassesResponse(
        teacher_id=teacher_id,
        assigned_classes=assigned_items
    )


# ------------------------------------------------------------------
# STEP 2B: Assign / Replace Subjects
# ------------------------------------------------------------------

@router.put(
    "/{teacher_id}/subjects", 
    response_model=AssignSubjectsResponse,
    dependencies=[Depends(allow_admin_only)]
)
def assign_teacher_subjects(
    teacher_id: UUID, 
    payload: AssignSubjectsRequest, 
    session: Session = Depends(get_session)
):
    """
    Step 2B: Sync subject assignments. Replaces existing subject links 
    and returns only the updated subject roster.
    """
    teacher = session.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found."
        )

    # 1. Clear current subject links
    existing_links = session.exec(
        select(TeacherSubjectLink).where(TeacherSubjectLink.teacher_id == teacher_id)
    ).all()
    for link in existing_links:
        session.delete(link)
    session.flush()

    # 2. Add new subject links
    assigned_items = []
    if payload.subject_ids:
        valid_subjects = session.exec(
            select(Subject).where(Subject.id.in_(payload.subject_ids))
        ).all()
        
        if len(valid_subjects) != len(set(payload.subject_ids)):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more subject IDs provided are invalid."
            )

        for sub in valid_subjects:
            session.add(TeacherSubjectLink(teacher_id=teacher_id, subject_id=sub.id))
            assigned_items.append(AssignedSubjectItem(id=sub.id, name=sub.name))

    session.commit()

    return AssignSubjectsResponse(
        teacher_id=teacher_id,
        assigned_subjects=assigned_items
    )


# ------------------------------------------------------------------
# Demographic Profile Updates (PATCH /teachers/{id})
# ------------------------------------------------------------------

@router.patch(
    "/{teacher_id}", 
    response_model=TeacherProfileUpdateResponse,
    dependencies=[Depends(allow_admin_only)]
)
def update_teacher_profile(
    teacher_id: UUID, 
    payload: TeacherProfileUpdateRequest, 
    session: Session = Depends(get_session)
):
    """Update demographic and professional details without modifying schedule links."""
    teacher = session.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found."
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(teacher, key, value)

    session.add(teacher)
    session.commit()
    session.refresh(teacher)

    return TeacherProfileUpdateResponse(
        id=teacher.id,
        user_id=teacher.user_id,
        first_name=teacher.first_name,
        last_name=teacher.last_name,
        phone_number=teacher.phone_number,
        gender=teacher.gender,
        department=teacher.department,
        qualification=teacher.qualification,
        address=teacher.address
    )


# ------------------------------------------------------------------
# GET Full Teacher Details (Demographics + Schedules Joined)
# ------------------------------------------------------------------

@router.get(
    "/{teacher_id}", 
    response_model=TeacherDetailResponse,
    dependencies=[Depends(allow_admin_only)]
)
def get_teacher_detail(
    teacher_id: UUID, 
    session: Session = Depends(get_session)
):
    """Fetch complete teacher profile including assigned classes and subjects."""
    teacher = session.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Teacher profile not found."
        )

    user = session.get(User, teacher.user_id)
    return build_teacher_detail_response(teacher, user.email)

# ------------------------------------------------------------------
# GET: List All Teachers
# ------------------------------------------------------------------
@router.get("/", response_model=List[TeacherCreateResponse], dependencies=[Depends(allow_admin_only)])
def list_teachers(
    search: Optional[str] = Query(None, description="Search by Department or ID"),
    name: Optional[str] = Query(None, description="Search by first name, last name, or full name"), 
    session: Session = Depends(get_session)
):
    """Lists teacher profiles with optional query filters for department, ID, or name."""
    
    # Start the query joining TeacherProfile and User
    query = session.query(TeacherProfile, User).join(User, TeacherProfile.user_id == User.id)
        
    # 1. Department or ID filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                TeacherProfile.department.ilike(search_term),
                # Cast the UUID to a string so we can safely search it
                func.cast(TeacherProfile.id, String).ilike(search_term)
            )
        )
        
    # 2. 🧠 Smart Name filter (Checks First, Last, and Combined Full Name)
    if name:
        search_term = f"%{name}%"
        
        # Stitch the fields together in memory: "Firstname Lastname"
        full_name_concat = func.concat(TeacherProfile.first_name, ' ', TeacherProfile.last_name)
        
        query = query.filter(
            or_(
                TeacherProfile.first_name.ilike(search_term),
                TeacherProfile.last_name.ilike(search_term),
                full_name_concat.ilike(search_term)
            )
        )
    
    # Optional: order by newest first
    query = query.order_by(TeacherProfile.created_at.desc())
    
    results = query.all()

    # 3. Return using your helper function or mapping directly to your schema
    # (Assuming build_teacher_detail_response is available in this file like in the previous code)
    return [
        TeacherCreateResponse(
            id=profile.id,
            user_id=user.id,
            first_name=profile.first_name,
            last_name=profile.last_name,
            email=user.email,
            phone_number=profile.phone_number,
            gender=profile.gender,
            department=profile.department,
            qualification=profile.qualification,
            address=profile.address,
            created_at=profile.created_at
            )
            for profile, user in results
            ]