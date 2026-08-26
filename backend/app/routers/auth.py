from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from backend.app.core.auth_utils import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_context,
    CurrentContext
)
from backend.app.db.database import get_session
from backend.app.models import (
    User, UserSchoolLink, Role, 
    StudentProfile, ParentProfile, TeacherProfile, AdminProfile
)
from backend.app.schemas_events import BaseEvent
from backend.app.services.publisher import publish_event


router = APIRouter(prefix="/auth", tags=["Authentication"])

# --- REQUEST/RESPONSE SCHEMAS ---

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role_name: str # e.g., "admin"
    school_id: UUID # 🆕 Required to link the new user to a workspace
    first_name: Optional[str] = "System"
    last_name: Optional[str] = "Admin"
    phone_number: Optional[str] = None

class UserRegisterResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    school_id: UUID
    profile_id: Optional[UUID] = None

class UserSummary(BaseModel):
    id: UUID
    role: str
    first_name: str
    last_name: str
    school_id: UUID  

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserSummary


# --- ENDPOINTS ---

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRegisterResponse)
def register_user(
    request: UserRegisterRequest, 
    session: Session = Depends(get_session)
):
    """Registers a central user identity and links them to a school."""
    
    # 1. Verify the Role exists in the DB
    role = session.exec(select(Role).where(Role.name == request.role_name.lower())).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{request.role_name}' does not exist.")

    # 2. Prevent duplicate registrations globally
    existing_user = session.exec(select(User).where(User.email == request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 3. Create Global User
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password)
    )
    session.add(new_user)
    session.flush()  

    # 4. Link User to the School
    user_link = UserSchoolLink(
        user_id=new_user.id,
        school_id=request.school_id,
        role_id=role.id
    )
    session.add(user_link)
    session.flush()

    profile_id = None

    # 5. Handle Admin Profile Creation (Tenant-Scoped)
    if role.name.lower() == "admin":
        admin_prof = AdminProfile(
            user_id=new_user.id,
            school_id=request.school_id,
            first_name=request.first_name,
            last_name=request.last_name,
            phone_number=request.phone_number
        )
        session.add(admin_prof)
        session.flush()
        profile_id = admin_prof.id

    session.commit()

    # 6. Broadcast the event outward
    event = BaseEvent(
        event_type="user_registered",
        payload={
            "user_id": str(new_user.id),
            "email": new_user.email,
            "school_id": str(request.school_id),
            "profile_id": str(profile_id) if profile_id else None,
        },
    )
    publish_event(event)

    return UserRegisterResponse(
        user_id=new_user.id,
        email=new_user.email,
        school_id=request.school_id,
        profile_id=profile_id,
    )


@router.post("/login", response_model=LoginResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Authenticates a global user, selects their workspace, and returns a rich profile payload."""
    
    # 1. Authenticate the Global User
    user = session.exec(select(User).where(User.email == form_data.username)).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Find their School Workspaces & Role Link
    active_link = session.exec(
        select(UserSchoolLink).where(UserSchoolLink.user_id == user.id)
    ).first()

    if not active_link:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not linked to any school. Please contact support."
        )
        
    # Fetch the actual Role object to get its string name
    role = session.exec(select(Role).where(Role.id == active_link.role_id)).first()
    role_name = role.name.lower() if role else "unknown"

    # 3. Create the Multi-Tenant JWT Token
    access_token = create_access_token(
        user_id=str(user.id),
        school_id=str(active_link.school_id),
        role_id=str(active_link.role_id)
    )
    
    # 4. Handle relational profile lookups (Scoping to BOTH user_id and school_id)
    first_name = "Campus"
    last_name = "User"
    profile = None

    if role_name == "student":
        profile = session.exec(select(StudentProfile).where(StudentProfile.user_id == user.id, StudentProfile.school_id == active_link.school_id)).first()
    elif role_name == "parent":
        profile = session.exec(select(ParentProfile).where(ParentProfile.user_id == user.id, ParentProfile.school_id == active_link.school_id)).first()
    elif role_name == "teacher":
        profile = session.exec(select(TeacherProfile).where(TeacherProfile.user_id == user.id, TeacherProfile.school_id == active_link.school_id)).first()
    elif role_name == "admin":
        profile = session.exec(select(AdminProfile).where(AdminProfile.user_id == user.id, AdminProfile.school_id == active_link.school_id)).first()

    if profile:
        first_name = getattr(profile, "first_name", first_name)
        last_name = getattr(profile, "last_name", last_name)

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserSummary(
            id=user.id, 
            role=role_name,
            first_name=first_name,
            last_name=last_name,
            school_id=active_link.school_id
        )
    )


@router.get("/me")
def get_current_user_profile(
    context: CurrentContext = Depends(get_current_context), # 👈 The Gatekeeper is in charge now!
    session: Session = Depends(get_session)
):
    """Safely decodes any validated user token and reads back account tracking details."""
    
    # 1. Fetch Global User
    user = session.get(User, context.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Fetch Active Role
    role = session.get(Role, context.role_id)
    role_name = role.name.lower() if role else "unknown"

    first_name = "Campus"
    last_name = "User"

    # 3. Fetch Tenant-Scoped Profile
    profile = None
    if role_name == "student":
        profile = session.exec(select(StudentProfile).where(StudentProfile.user_id == user.id, StudentProfile.school_id == context.school_id)).first()
    elif role_name == "parent":
        profile = session.exec(select(ParentProfile).where(ParentProfile.user_id == user.id, ParentProfile.school_id == context.school_id)).first()
    elif role_name == "teacher":
        profile = session.exec(select(TeacherProfile).where(TeacherProfile.user_id == user.id, TeacherProfile.school_id == context.school_id)).first()
    elif role_name == "admin":
        profile = session.exec(select(AdminProfile).where(AdminProfile.user_id == user.id, AdminProfile.school_id == context.school_id)).first()

    if profile:
        first_name = getattr(profile, "first_name", first_name)
        last_name = getattr(profile, "last_name", last_name)

    return {
        "id": user.id,
        "email": user.email,
        "role": role_name,
        "first_name": first_name,
        "last_name": last_name,
        "school_id": context.school_id,
        "is_active": user.is_active,
        "created_at": user.created_at
    }