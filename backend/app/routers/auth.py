from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlmodel import Session

from backend.app.core.auth_utils import create_access_token, hash_password, verify_password
from backend.app.db.database import get_session
from backend.app.models import ParentProfile, StudentProfile, User, UserRole
from backend.app.schemas_events import BaseEvent
from backend.app.services.publisher import publish_event

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    admission_number: str | None = None
    class_name: str | None = None
    phone_number: str | None = None


class UserRegisterResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    role: UserRole
    profile_id: UUID | None = None


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRegisterResponse)
def register_user(request: UserRegisterRequest, session: Session = Depends(get_session)):
    existing_user = session.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    hashed_pwd = hash_password(request.password)

    new_user = User(
        email=request.email,
        password_hash=hashed_pwd,
        role=request.role,
    )
    session.add(new_user)
    session.flush()

    profile_id = None

    if request.role == UserRole.STUDENT:
        if not request.admission_number or not request.class_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Students require an admission number and class name.",
            )
        student_prof = StudentProfile(
            user_id=new_user.id,
            admission_number=request.admission_number,
            class_name=request.class_name,
        )
        session.add(student_prof)
        session.flush()
        profile_id = student_prof.id

    elif request.role == UserRole.PARENT:
        if not request.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parents require a contact phone number.",
            )
        parent_prof = ParentProfile(
            user_id=new_user.id,
            phone_number=request.phone_number,
        )
        session.add(parent_prof)
        session.flush()
        profile_id = parent_prof.id

    session.commit()

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


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = session.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = {
        "sub": user.email,
        "user_id": str(user.id),
        "role": user.role.value,
    }

    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}
