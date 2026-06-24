# backend/app/routers/parents.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from backend.app.db.database import get_session
from backend.app.models import User, ParentProfile, UserRole
from backend.app.schemas.parent import ParentCreate, ParentResponse
from backend.app.core.auth_utils import RoleChecker, hash_password

router = APIRouter(
    prefix="/parents",
    tags=["Parent Management"]
)

allow_staff_only = RoleChecker(["admin", "teacher"])

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ParentResponse, dependencies=[Depends(allow_staff_only)])
def create_parent(request: ParentCreate, session: Session = Depends(get_session)):
    """Registers a parent user identity and binds it to a fresh parent profile."""
    # 1. Check if email exists
    existing_user = session.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # 2. Write core identity
    new_user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        role=UserRole.PARENT
    )
    session.add(new_user)
    session.flush()

    # 3. Write profile
    new_profile = ParentProfile(
        user_id=new_user.id,
        phone_number=request.phone_number
    )
    session.add(new_profile)
    session.commit()
    session.refresh(new_profile)

    return ParentResponse(
        id=new_profile.id,
        user_id=new_user.id,
        email=new_user.email,
        phone_number=new_profile.phone_number,
        created_at=new_profile.created_at
    )

@router.get("/", response_model=List[ParentResponse], dependencies=[Depends(allow_staff_only)])
def list_parents(session: Session = Depends(get_session)):
    """Lists all registered parents with their mapped system identities."""
    query = session.query(ParentProfile, User).join(User, ParentProfile.user_id == User.id)
    results = query.all()

    return [
        ParentResponse(
            id=profile.id,
            user_id=user.id,
            email=user.email,
            phone_number=profile.phone_number,
            created_at=profile.created_at
        )
        for profile, user in results
    ]