# backend/app/routers/announcements.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response
from sqlmodel import Session, select
from typing import List
from uuid import UUID
from datetime import datetime

from backend.app.db.database import get_session
from backend.app.models import (
    Announcement, AnnouncementStatus, UserRole, 
    StudentProfile, ParentStudentLink, User, PriorityEnum
)
from backend.app.schemas.announcement import AnnouncementCreate, AnnouncementResponse, AnnouncementUpdate
from backend.app.core.auth_utils import get_current_token_payload, RoleChecker

# Make sure BackgroundTasks is imported from fastapi if it isn't already

router = APIRouter(prefix="/announcements", tags=["Announcements"])

# Helper function to mock the background email/push task
def send_push_notifications(audience: str, title: str):
    # In the future, this will query the DB for emails based on the audience
    print(f"BACKGROUND TASK: Sending push notifications to {audience} for '{title}'")

@router.post("/", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    request: AnnouncementCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: dict = Depends(RoleChecker(["admin", "teacher"]))
):
    """Creates a targeted announcement and triggers background notifications."""
    
    new_announcement = Announcement(
        title=request.title,
        content=request.content,
        category=request.category,
        audience=request.audience,
        priority=request.priority,
        status=request.status,
        author_id=UUID(current_user["user_id"])
    )
    
    session.add(new_announcement)
    session.commit()
    session.refresh(new_announcement)
    
    # If published, fire the background worker so the API responds instantly
    if new_announcement.status == AnnouncementStatus.PUBLISHED:
        background_tasks.add_task(send_push_notifications, request.audience, request.title)
        
    return new_announcement


from fastapi import Query
from typing import Optional

@router.get("/", response_model=List[AnnouncementResponse])
def get_smart_announcement_feed(
    status: Optional[AnnouncementStatus] = Query(None, description="Filter by status (e.g. PUBLISHED, DRAFT)"),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority (e.g. HIGH, MEDIUM)"),
    audience: Optional[str] = Query(None, description="Filter by target audience (e.g. ALL, JSS 1)"),
    session: Session = Depends(get_session),
    payload: dict = Depends(get_current_token_payload)
):
    """Returns a filtered feed of announcements based on the user's role and optional query parameters."""
    
    user_id = UUID(payload.get("user_id"))
    user_role = payload.get("role")
    
    # Base query
    query = select(Announcement)
    
    # ==========================================
    # 1. APPLY EXPLICIT QUERY FILTERS
    # ==========================================
    
    # A. Status Filter (With Security Check)
    if status:
        query = query.where(Announcement.status == status)
        # Security: If viewing drafts, non-admins can only see their own drafts
        if status == AnnouncementStatus.DRAFT and user_role != UserRole.ADMIN.value:
            query = query.where(Announcement.author_id == user_id)
    else:
        # Maintain current behavior: Default to PUBLISHED if no status is requested
        query = query.where(Announcement.status == AnnouncementStatus.PUBLISHED)

    # B. Priority Filter
    if priority:
        query = query.where(Announcement.priority == priority)


    # ==========================================
    # 2. APPLY ROLE-BASED ROUTING & AUDIENCE FILTER
    # ==========================================
    if user_role == UserRole.ADMIN.value:
        # Admins see everything. If they specified an audience, just apply it.
        if audience:
            query = query.where(Announcement.audience == audience)
            
    else:
        # Build allowed audiences for the logged-in user
        allowed_audiences = ["ALL"]
        
        if user_role == UserRole.TEACHER.value:
            allowed_audiences.append("ALL_TEACHERS")
            
        elif user_role == UserRole.STUDENT.value:
            allowed_audiences.append("ALL_STUDENTS")
            student = session.exec(select(StudentProfile).where(StudentProfile.user_id == user_id)).first()
            if student and student.class_name:
                allowed_audiences.append(student.class_name)
                
        elif user_role == UserRole.PARENT.value:
            allowed_audiences.append("ALL_PARENTS")
            children_classes = session.exec(
                select(StudentProfile.class_name)
                .join(ParentStudentLink, ParentStudentLink.student_id == StudentProfile.id)
                .where(ParentStudentLink.parent_id == user_id)
            ).all()
            allowed_audiences.extend([cls for cls in children_classes if cls])

        # Apply the RBAC security filter
        query = query.where(Announcement.audience.in_(allowed_audiences))
        
        # Apply explicit audience filter if requested
        # (SQL will naturally intersect this: e.g., "Must be in allowed list AND must equal requested audience")
        if audience:
            query = query.where(Announcement.audience == audience)

    # Execute the final chained query
    return session.exec(query.order_by(Announcement.created_at.desc())).all()

@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_single_announcement(
    announcement_id: UUID,
    session: Session = Depends(get_session),
    payload: dict = Depends(get_current_token_payload)
):
    """Fetches a single announcement. Hides drafts from non-authors."""
    
    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    user_id = UUID(payload.get("user_id"))
    user_role = payload.get("role")

    # Security: If it's a DRAFT, only the author or an admin can see it
    if announcement.status == AnnouncementStatus.DRAFT:
        if user_role != UserRole.ADMIN.value and announcement.author_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="You do not have permission to view this draft."
            )

    return announcement


@router.patch("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID,
    request: AnnouncementUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    payload: dict = Depends(RoleChecker(["admin", "teacher"])) # Only staff can edit
):
    """Updates an announcement. Only allowed by the author or an Admin."""
    
    user_id = UUID(payload.get("user_id"))
    user_role = payload.get("role")

    # 1. Fetch the announcement
    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found.")

    # 2. Authorization check: Are you Admin or the original Author?
    if user_role != UserRole.ADMIN.value and announcement.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own announcements."
        )

    # 3. Track if it is being published right now (so we can send emails)
    was_draft = announcement.status == AnnouncementStatus.DRAFT
    is_publishing_now = request.status == AnnouncementStatus.PUBLISHED

    # 4. Apply only the fields that were actually provided in the request
    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(announcement, key, value)

    announcement.updated_at = datetime.now(timezone.utc)

    session.add(announcement)
    session.commit()
    session.refresh(announcement)

    # 5. If it just changed from DRAFT to PUBLISHED, trigger the push notifications!
    if was_draft and is_publishing_now:
        background_tasks.add_task(send_push_notifications, announcement.audience, announcement.title)

    return announcement


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: UUID,
    session: Session = Depends(get_session),
    payload: dict = Depends(get_current_token_payload)
):
    """Permanently deletes an announcement. Restricted to Admins or the original author."""
    
    user_id = UUID(payload.get("user_id"))
    user_role = payload.get("role")
    
    # 1. Find the announcement
    announcement = session.get(Announcement, announcement_id)
    if not announcement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Announcement not found."
        )
        
    # 2. Authorization check: Are you an Admin OR the original author?
    if user_role != UserRole.ADMIN.value and announcement.author_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this announcement."
        )
        
    # 3. Permanently delete
    session.delete(announcement)
    session.commit()
    
    # Returning a 204 No Content is REST standard for a successful DELETE
    return Response(status_code=status.HTTP_204_NO_CONTENT)