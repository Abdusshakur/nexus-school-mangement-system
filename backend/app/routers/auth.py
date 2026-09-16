from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import and_, or_
from sqlmodel import Session, select

from backend.app.core.auth_utils import (
    create_access_token,
    hash_password,
    verify_password,
    get_current_context,
    get_active_context,
    require_permission,
    CurrentContext
)
from backend.app.db.database import get_session
from backend.app.models import (
    MembershipStatus, School, SchoolStatus, UserStatus,
    User, UserSchoolLink, Role, 
    StudentProfile, ParentProfile, TeacherProfile, AdminProfile, RoleScope
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
    school_id: Optional[UUID] = None


class WorkspaceSummary(BaseModel):
    school_id: UUID
    school_name: str
    role_id: UUID
    role: str


class WorkspaceSelectionRequest(BaseModel):
    email: EmailStr
    password: str
    school_id: UUID

class LoginResponse(BaseModel):
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserSummary
    requires_school_selection: bool = False
    workspaces: list[WorkspaceSummary] = Field(default_factory=list)


# --- ENDPOINTS ---

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRegisterResponse)
def register_user(
    request: UserRegisterRequest, 
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session)
):
    """Register a user inside the current active school workspace."""

    if request.school_id != context.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Users can only be registered in the current school.",
        )
    if request.role_name.lower() in {"super_admin", "superadmin"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super administrator accounts cannot be created through this endpoint.",
        )
    
    # 1. Verify the Role exists in the DB
    role = session.exec(
        select(Role).where(
            Role.name == request.role_name.lower(),
            or_(
                Role.scope == RoleScope.PLATFORM,
                and_(Role.scope == RoleScope.SCHOOL, Role.school_id == context.school_id),
            ),
        )
    ).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{request.role_name}' does not exist.")

    # 2. Prevent duplicate registrations globally
    existing_user = session.exec(select(User).where(User.email == request.email)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 3. Create Global User
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        status=UserStatus.ACTIVE,
        is_active=True,
    )
    session.add(new_user)
    session.flush()  

    # 4. Link User to the School
    user_link = UserSchoolLink(
        user_id=new_user.id,
        school_id=context.school_id,
        role_id=role.id,
        status=MembershipStatus.ACTIVE,
        is_active=True,
        activated_at=new_user.created_at,
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
            "school_id": str(context.school_id),
            "profile_id": str(profile_id) if profile_id else None,
        },
    )
    publish_event(event)

    return UserRegisterResponse(
        user_id=new_user.id,
        email=new_user.email,
        school_id=context.school_id,
        profile_id=profile_id,
    )


def _authenticate_user(email: str, password: str, session: Session) -> User:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active or user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail="Your account is not active.")
    return user


def _active_workspaces(user_id: UUID, session: Session):
    rows = session.exec(
        select(UserSchoolLink, School, Role)
        .join(School, UserSchoolLink.school_id == School.id)
        .join(Role, UserSchoolLink.role_id == Role.id)
        .where(
            UserSchoolLink.user_id == user_id,
            UserSchoolLink.is_active.is_(True),
            UserSchoolLink.status == MembershipStatus.ACTIVE,
            School.is_active.is_(True),
            School.status == SchoolStatus.ACTIVE,
            or_(
                Role.scope == RoleScope.PLATFORM,
                and_(Role.scope == RoleScope.SCHOOL, Role.school_id == UserSchoolLink.school_id),
            ),
        )
    ).all()
    return rows


def _workspace_options(rows) -> list[WorkspaceSummary]:
    return [
        WorkspaceSummary(
            school_id=link.school_id,
            school_name=school.name,
            role_id=role.id,
            role=role.name.lower(),
        )
        for link, school, role in rows
    ]


def _profile_names(user: User, role_name: str, school_id: UUID, session: Session):
    profile = None
    profile_model = {
        "student": StudentProfile,
        "parent": ParentProfile,
        "teacher": TeacherProfile,
        "admin": AdminProfile,
    }.get(role_name)
    if profile_model:
        profile = session.exec(
            select(profile_model).where(
                profile_model.user_id == user.id,
                profile_model.school_id == school_id,
            )
        ).first()
    return (
        getattr(profile, "first_name", "Campus") if profile else "Campus",
        getattr(profile, "last_name", "User") if profile else "User",
    )


def _selected_login_response(user: User, link: UserSchoolLink, role: Role, session: Session, rows):
    role_name = role.name.lower()
    first_name, last_name = _profile_names(user, role_name, link.school_id, session)
    return LoginResponse(
        access_token=create_access_token(
            user_id=str(user.id),
            school_id=str(link.school_id),
            role_id=str(link.role_id),
        ),
        token_type="bearer",
        user=UserSummary(
            id=user.id,
            role=role_name,
            first_name=first_name,
            last_name=last_name,
            school_id=link.school_id,
        ),
        workspaces=_workspace_options(rows),
    )


@router.post("/login", response_model=LoginResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    """Authenticate a user and issue a token when one active workspace exists."""
    user = _authenticate_user(form_data.username, form_data.password, session)
    rows = _active_workspaces(user.id, session)
    if not rows:
        raise HTTPException(
            status_code=403,
            detail="Your account is not linked to an active school. Please contact support.",
        )
    if len(rows) > 1:
        return LoginResponse(
            user=UserSummary(
                id=user.id,
                role="multiple",
                first_name="Campus",
                last_name="User",
            ),
            requires_school_selection=True,
            workspaces=_workspace_options(rows),
        )
    link, _, role = rows[0]
    return _selected_login_response(user, link, role, session, rows)


@router.post("/select-school", response_model=LoginResponse)
def select_school_workspace(
    request: WorkspaceSelectionRequest,
    session: Session = Depends(get_session),
):
    """Authenticate again and issue a token for the selected school workspace."""
    user = _authenticate_user(str(request.email), request.password, session)
    rows = _active_workspaces(user.id, session)
    selected = next((row for row in rows if row[0].school_id == request.school_id), None)
    if not selected:
        raise HTTPException(status_code=403, detail="You do not have an active membership in that school.")
    link, _, role = selected
    return _selected_login_response(user, link, role, session, rows)


@router.get("/workspaces", response_model=list[WorkspaceSummary])
def list_my_workspaces(
    context: CurrentContext = Depends(get_active_context),
    session: Session = Depends(get_session),
):
    """List the authenticated user's active school memberships."""
    return _workspace_options(_active_workspaces(context.user_id, session))


@router.get("/me")
def get_current_user_profile(
    context: CurrentContext = Depends(get_active_context), # 👈 The Gatekeeper is in charge now!
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
