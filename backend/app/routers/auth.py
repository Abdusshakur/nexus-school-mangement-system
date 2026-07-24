
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from backend.app.core.auth_utils import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_token_payload,
)
from backend.app.db.database import get_session
from backend.app.models import ParentProfile, StudentProfile, User, UserRole, TeacherProfile, AdminProfile
from backend.app.schemas_events import BaseEvent
from backend.app.services.publisher import publish_event


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

# --- REQUEST/RESPONSE SCHEMAS ---

class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    admission_number: Optional[str] = None
    class_name: Optional[str] = None
    phone_number: Optional[str] = None

class UserRegisterResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    role: UserRole
    profile_id: Optional[UUID] = None

class UserSummary(BaseModel):
    id: UUID
    role: UserRole
    first_name: Optional[str] = "John"
    last_name: Optional[str] = "Doe"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummary


# --- ENDPOINTS ---

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRegisterResponse)
def register_user(
    request: UserRegisterRequest, 
    session: Session = Depends(get_session)
):
    """Registers a central user identity. Strictly limited to System Admins."""
    
    # 1. Enforce Architectural Boundaries! 
    # Force the frontend to use the dedicated onboarding endpoints for these roles.
    if request.role in [UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot register {request.role}s here. Please use the dedicated /api/v1/{request.role.value.lower()}s/ onboarding endpoints."
        )

    # 2. Prevent duplicate registrations
    existing_user = session.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # 3. Scramble password securely
    hashed_pwd = hash_password(request.password)

    new_user = User(
        email=request.email,
        password_hash=hashed_pwd,
        role=request.role,
    )
    session.add(new_user)
    session.flush()  # Generates new_user.id UUID early

    profile_id = None

    # 4. Handle Admin Profile Creation
    if request.role == UserRole.ADMIN:
        # Assuming your UserRegisterRequest schema has these, or you can hardcode fallbacks
        first_name = getattr(request, 'first_name', 'System')
        last_name = getattr(request, 'last_name', 'Admin')
        phone = getattr(request, 'phone_number', None)
        
        admin_prof = AdminProfile(
            user_id=new_user.id,
            first_name=first_name,
            last_name=last_name,
            phone_number=phone
        )
        session.add(admin_prof)
        session.flush()
        profile_id = admin_prof.id

    # Commit ensures all steps succeeded, otherwise rolls back completely
    session.commit()

    # 5. Broadcast the event outward to background services
    event = BaseEvent(
        event_type="user_registered",
        payload={
            "user_id": str(new_user.id),
            "email": new_user.email,
            "role": new_user.role.value,
            "profile_id": str(profile_id) if profile_id else None,
        },
    )
    publish_event(event)

    return UserRegisterResponse(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        profile_id=profile_id,
    )

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Verifies incoming credentials and signs a new access token matching your custom MVP format."""
    user = session.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 1. Package token payload details securely
    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": str(user.role.value if hasattr(user.role, 'value') else user.role)
    }

    access_token = create_access_token(data=token_data)
    
    # 2. Establish defaults for fallback handling
    first_name = "Campus"
    last_name = "User"

    # 3. Handle relational lookups dynamically based on system role types
    if user.role == UserRole.STUDENT:
        profile = session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    elif user.role == UserRole.PARENT:
        profile = session.query(ParentProfile).filter(ParentProfile.user_id == user.id).first()
    elif user.role == UserRole.TEACHER:
        profile = session.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    elif user.role == UserRole.ADMIN:
        profile = session.query(AdminProfile).filter(AdminProfile.user_id == user.id).first()
    else:
        profile = None

    # Safely extract names if a profile was found
    if profile:
        first_name = getattr(profile, "first_name", first_name)
        last_name = getattr(profile, "last_name", last_name)

    # 4. Return the complete aggregated payload back to the client interface
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserSummary(
            id=user.id, 
            role=user.role,
            first_name=first_name,
            last_name=last_name
        )
    )


@router.get("/me")
def get_current_user_profile(
    payload: dict = Depends(get_current_token_payload),
    session: Session = Depends(get_session)
):
    """Safely decodes any validated user token and reads back account tracking details."""
    user_id = payload.get("user_id")
    user = session.get(User, user_id)
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
        
    first_name = "Campus"
    last_name = "User"

    # Fetch names here too so page refreshes don't break the frontend UI
    if user.role == UserRole.STUDENT:
        profile = session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    elif user.role == UserRole.PARENT:
        profile = session.query(ParentProfile).filter(ParentProfile.user_id == user.id).first()
    elif user.role == UserRole.TEACHER:
        profile = session.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    elif user.role == UserRole.ADMIN:
        profile = session.query(AdminProfile).filter(AdminProfile.user_id == user.id).first()
    else:
        profile = None

    if profile:
        first_name = getattr(profile, "first_name", first_name)
        last_name = getattr(profile, "last_name", last_name)

    return {
        "id": user.id,
        "email": user.email,
        "role": user.role,
        "first_name": first_name,
        "last_name": last_name,
        "is_active": user.is_active,
        "created_at": user.created_at
    }