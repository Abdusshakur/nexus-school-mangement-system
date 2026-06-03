# routers/auth.py (Part 1)
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from sqlmodel import Session
from uuid import UUID
from database import get_session
from models import User, UserRole, StudentProfile, ParentProfile
from auth_utils import hash_password, verify_password, create_access_token # bcrypt password hashing helper
from fastapi.security import OAuth2PasswordRequestForm
from publisher import publish_event
from schemas_events import BaseEvent
 

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# Core Registration Request
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    # Optional profile fields depending on what role is chosen
    admission_number: str | None = None
    class_name: str | None = None
    phone_number: str | None = None

# Custom Outgoing Response Structure
class UserRegisterResponse(BaseModel):
    user_id: UUID
    email: EmailStr
    role: UserRole
    profile_id: UUID | None = None  # Returns the ID of their student or parent profile if created

# routers/auth.py (Part 2)

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserRegisterResponse)
def register_user(request: UserRegisterRequest, session: Session = Depends(get_session)):
    # 1. Check if the email is already registered in PostgreSQL
    existing_user = session.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered"
        )
        
    # 2. Hash the raw password safely using native bcrypt
    hashed_pwd = hash_password(request.password)
    
    # 3. Create the core User record
    new_user = User(
        email=request.email,
        password_hash=hashed_pwd,
        role=request.role
    )
    session.add(new_user)
    session.flush() # Flush generates the new_user.id UUID *before* saving permanently
    
    profile_id = None
    
    # 4. Handle Profile Creation conditionally based on Roles
    if request.role == UserRole.STUDENT:
        if not request.admission_number or not request.class_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Students require an admission number and class name."
            )
        student_prof = StudentProfile(
            user_id=new_user.id,
            admission_number=request.admission_number,
            class_name=request.class_name
        )
        session.add(student_prof)
        session.flush()
        profile_id = student_prof.id
        
    elif request.role == UserRole.PARENT:
        if not request.phone_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parents require a contact phone number."
            )
        parent_prof = ParentProfile(
            user_id=new_user.id,
            phone_number=request.phone_number
        )
        session.add(parent_prof)
        session.flush()
        profile_id = parent_prof.id

    # 5. Commit saves everything to PostgreSQL all at once!
    session.commit()

     #Fire off our background event notification!
    event = BaseEvent(
        event_type="user_registered",
        payload={
            "user_id": str(new_user.id),
            "email": new_user.email,
            "role": str(new_user.role),
            "profile_id": str(profile_id) if profile_id else None
        }
    )
    publish_event(event) # Broadcasts the event asynchronously!
    
    return UserRegisterResponse(
        user_id=new_user.id,
        email=new_user.email,
        role=new_user.role,
        profile_id=profile_id
    )


@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # 1. Look up the user in PostgreSQL using the form's username (which will be their email)
    user = session.query(User).filter(User.email == form_data.username).first()
    
    # 2. Safety Check: If user doesn't exist, deny entry immediately
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 3. Security Check: Verify the raw password matches the database hash using native bcrypt
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 4. Success! Let's craft the JWT Token payload.
    # We embed their email, unique user ID, and crucially, their ROLE!
    token_data = {
        "sub": user.email, 
        "user_id": str(user.id),
        "role": user.role
    }
    
    access_token = create_access_token(data=token_data)
    
    # 5. Return the token string back to the client
    return {"access_token": access_token, "token_type": "bearer"}