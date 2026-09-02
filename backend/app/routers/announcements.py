# backend/app/routers/announcements.py
from fastapi import (APIRouter, Depends, HTTPException, status, 
                     BackgroundTasks, Query)
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timezone



from backend.app.db.database import get_session
from backend.app.models import (
    AdminProfile,
    Announcement,
    AnnouncementStatus,
    ParentProfile,
    ParentStudentLink,
    PriorityEnum,
    Role,
    StudentProfile,
    TeacherProfile,
    User,
    UserSchoolLink,
)
# 👇 1. Import the Gatekeeper
from backend.app.core.auth_utils import CurrentContext, require_permission, get_current_context
from backend.app.schemas.announcement import AnnouncementCreate, AnnouncementResponse, AnnouncementUpdate
from backend.app.services.parent_relationship_service import get_current_parent_profile

router = APIRouter(prefix="/announcements", tags=["Announcements"])

# Helper function to mock the background email/push task
def send_push_notifications(audience: str, title: str, school_id: UUID):
    # 👇 2. MULTI-TENANT WORKER: The worker must receive the school_id so it doesn't email the wrong school!
    print(f"BACKGROUND TASK: Sending push notifications to {audience} for '{title}' at School {school_id}")


def announcement_response(announcement: Announcement, session: Session) -> AnnouncementResponse:
    """Return an announcement with tenant-scoped author details."""
    user = session.get(User, announcement.author_id)
    role = None
    if user:
        link = session.exec(select(UserSchoolLink, Role).join(
            Role, UserSchoolLink.role_id == Role.id
        ).where(
            UserSchoolLink.user_id == announcement.author_id,
            UserSchoolLink.school_id == announcement.school_id,
            UserSchoolLink.is_active.is_(True),
        )).first()
        if link:
            role = link[1]
        elif user.role_id:
            role = session.get(Role, user.role_id)

    role_name = role.name if role else None
    profile_types = {
        "admin": AdminProfile,
        "teacher": TeacherProfile,
        "parent": ParentProfile,
        "student": StudentProfile,
    }
    profile_type = profile_types.get(role_name.lower() if role_name else "")
    profile = None
    if profile_type:
        profile = session.exec(select(profile_type).where(
            profile_type.user_id == announcement.author_id,
            profile_type.school_id == announcement.school_id,
        )).first()
    author_name = f"{profile.first_name} {profile.last_name}".strip() if profile else None

    return AnnouncementResponse(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        category=announcement.category,
        audience=announcement.audience,
        priority=announcement.priority,
        status=announcement.status,
        author_id=announcement.author_id,
        author_name=author_name,
        author_role=role_name,
        school_id=announcement.school_id,
        created_at=announcement.created_at,
    )

@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    request: AnnouncementCreate,
    background_tasks: BackgroundTasks,
    # 👇 3. RBAC & GATEKEEPER: Secure the endpoint
    context: CurrentContext = Depends(require_permission("announcement:write")),
    session: Session = Depends(get_session)
):
    """Creates a targeted announcement scoped to the active school and triggers notifications."""
    
    new_announcement = Announcement(
        title=request.title,
        content=request.content,
        category=request.category,
        audience=request.audience,
        priority=request.priority,
        status=request.status,
        author_id=context.user_id,         # 👈 Extract from Context
        school_id=context.school_id        # 👈 HARD-WIRED TENANT ISOLATION
    )
    
    session.add(new_announcement)
    session.commit()
    session.refresh(new_announcement)
    
    # If published, fire the background worker so the API responds instantly
    if new_announcement.status == AnnouncementStatus.PUBLISHED:
        background_tasks.add_task(
            send_push_notifications, 
            request.audience, 
            request.title, 
            context.school_id # 👈 Pass the tenant boundary to the worker
        )
        
    return announcement_response(new_announcement, session)


@router.get("/", response_model=List[AnnouncementResponse])
def get_smart_announcement_feed(
    status: Optional[AnnouncementStatus] = Query(None, description="Filter by status (e.g. PUBLISHED, DRAFT)"),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority (e.g. HIGH, MEDIUM)"),
    audience: Optional[str] = Query(None, description="Filter by target audience (e.g. ALL, JSS 1)"),
    session: Session = Depends(get_session),
    context: CurrentContext = Depends(get_current_context) # 👈 1. Gatekeeper handles auth
):
    """Returns a filtered feed of announcements based on the user's role and active school."""
    
    # 2. Resolve the dynamic role name for RBAC logic
    role = session.get(Role, context.role_id)
    role_name = role.name.lower() if role else ""
    
    # 3. BASE QUERY: Strictly isolate to the active tenant
    query = select(Announcement).where(Announcement.school_id == context.school_id)
    
    # ==========================================
    # A. APPLY EXPLICIT QUERY FILTERS
    # ==========================================
    if status:
        query = query.where(Announcement.status == status)
        # Security: If viewing drafts, non-admins can only see their own drafts
        if status == AnnouncementStatus.DRAFT and role_name != "admin":
            query = query.where(Announcement.author_id == context.user_id)
    else:
        # Default to PUBLISHED if no status is requested
        query = query.where(Announcement.status == AnnouncementStatus.PUBLISHED)

    if priority:
        query = query.where(Announcement.priority == priority)


    # ==========================================
    # B. APPLY ROLE-BASED ROUTING & AUDIENCE FILTER
    # ==========================================
    if role_name == "admin":
        # Admins see everything in their school.
        if audience:
            query = query.where(Announcement.audience == audience)
            
    else:
        allowed_audiences = ["ALL"]
        
        if role_name == "teacher":
            allowed_audiences.append("ALL_TEACHERS")
            
        elif role_name == "student":
            allowed_audiences.append("ALL_STUDENTS")
            # 👈 Ensure profile lookup is tenant-scoped
            student = session.exec(
                select(StudentProfile).where(
                    StudentProfile.user_id == context.user_id,
                    StudentProfile.school_id == context.school_id
                )
            ).first()
            if student and student.class_name:
                allowed_audiences.append(student.class_name)
                
        elif role_name == "parent":
            allowed_audiences.append("ALL_PARENTS")
            parent_profile = get_current_parent_profile(context, session)
            children_classes = session.exec(
                select(StudentProfile.class_name)
                .join(ParentStudentLink, ParentStudentLink.student_id == StudentProfile.id)
                .where(
                    ParentStudentLink.parent_id == parent_profile.id,
                    ParentStudentLink.school_id == context.school_id,
                    StudentProfile.school_id == context.school_id # 👈 Tenant isolation
                )
            ).all()
            allowed_audiences.extend([cls for cls in children_classes if cls])

        query = query.where(Announcement.audience.in_(allowed_audiences))
        
        if audience:
            query = query.where(Announcement.audience == audience)

    announcements = session.exec(query.order_by(Announcement.created_at.desc())).all()
    return [announcement_response(item, session) for item in announcements]


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_single_announcement(
    announcement_id: UUID,
    session: Session = Depends(get_session),
    context: CurrentContext = Depends(get_current_context) # 👈 Gatekeeper
):
    """Fetches a single announcement. Hides drafts from non-authors."""
    
    # 1. SECURE FETCH: Ensure the announcement belongs to their school
    announcement = session.exec(
        select(Announcement).where(
            Announcement.id == announcement_id,
            Announcement.school_id == context.school_id
        )
    ).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    # 2. Resolve Role
    role = session.get(Role, context.role_id)
    role_name = role.name.lower() if role else ""

    # 3. Draft Security
    if announcement.status == AnnouncementStatus.DRAFT:
        if role_name != "admin" and announcement.author_id != context.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have permission to view this draft."
            )

    return announcement_response(announcement, session)


@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID,
    request: AnnouncementUpdate,
    background_tasks: BackgroundTasks,
    context: CurrentContext = Depends(require_permission("announcement:write")), # 👈 Gatekeeper Auth
    session: Session = Depends(get_session)
):
    """Updates an announcement. Only allowed by the author or an Admin within the same school."""
    
    # 1. SECURE FETCH: Ensure the announcement belongs to their school
    announcement = session.exec(
        select(Announcement).where(
            Announcement.id == announcement_id, 
            Announcement.school_id == context.school_id
        )
    ).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    # 2. Resolve Role for authorization logic
    role = session.get(Role, context.role_id)
    role_name = role.name.lower() if role else ""

    # 3. Authorization check: Are you Admin or the original Author?
    if role_name != "admin" and announcement.author_id != context.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own announcements."
        )

    was_draft = announcement.status == AnnouncementStatus.DRAFT
    is_publishing_now = request.status == AnnouncementStatus.PUBLISHED

    # 4. Apply only provided fields
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(announcement, key, value)

    announcement.updated_at = datetime.now(timezone.utc)

    session.add(announcement)
    session.commit()
    session.refresh(announcement)

    # 5. MULTI-TENANT WORKER: Pass the school_id to the background task!
    if was_draft and is_publishing_now:
        background_tasks.add_task(
            send_push_notifications, 
            announcement.audience, 
            announcement.title,
            context.school_id # 👈 Critical fix
        )

    return announcement_response(announcement, session)


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: UUID,
    context: CurrentContext = Depends(require_permission("announcement:delete")),
    session: Session = Depends(get_session)
):
    """Deletes an announcement safely within the tenant boundary."""
    
    # 1. SECURE FETCH: Verify ownership before deletion
    announcement = session.exec(
        select(Announcement).where(
            Announcement.id == announcement_id, 
            Announcement.school_id == context.school_id
        )
    ).first()
    
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    # 2. Resolve Role
    role = session.get(Role, context.role_id)
    role_name = role.name.lower() if role else ""

    # 3. Authorization check
    if role_name != "admin" and announcement.author_id != context.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own announcements."
        )

    session.delete(announcement)
    session.commit()
    return
