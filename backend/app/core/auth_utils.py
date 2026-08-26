import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from jose import JWTError, jwt
from sqlmodel import Session, select

# Import get_session and models inside functions to avoid circular imports
from backend.app.db.database import get_session
from backend.app.models import Role 

load_dotenv()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "your-fallback-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720

# ==========================================
# 1. CORE SCHEMAS & UTILS
# ==========================================

class CurrentContext(BaseModel):
    """Holds the validated user identity and their active workspace constraints."""
    user_id: UUID
    school_id: UUID
    role_id: UUID  

def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    return hashed_bytes.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(
    user_id: str, 
    school_id: str, 
    role_id: str, 
    expires_delta: Optional[timedelta] = None
) -> str:
    """Generates a JWT containing the user's global ID, active workspace, and RBAC role."""
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    
    to_encode = {
        "sub": str(user_id), 
        "school_id": str(school_id),
        "role_id": str(role_id), 
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ==========================================
# 2. DEPENDENCIES (GATEKEEPER & RBAC)
# ==========================================

def get_current_context(token: str = Depends(oauth2_scheme)) -> CurrentContext:
    """
    THE GATEKEEPER:
    Intercepts the JWT token, verifies its signature, and extracts the tenant context.
    Prevents cross-tenant data leakage by enforcing school_id on all operations.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id_str: str = payload.get("sub")  
        school_id_str: str = payload.get("school_id")
        role_id_str: str = payload.get("role_id") 
        
        if user_id_str is None or school_id_str is None or role_id_str is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    return CurrentContext(
        user_id=UUID(user_id_str), 
        school_id=UUID(school_id_str), 
        role_id=UUID(role_id_str) 
    )

def require_permission(required_permission: str):
    """
    RBAC Gatekeeper: Checks if the user's current role has the required permission.
    Usage: @router.post("/data", dependencies=[Depends(require_permission("data:write"))])
    """
    def permission_checker(
        context: CurrentContext = Depends(get_current_context),
        session: Session = Depends(get_session)
    ) -> CurrentContext:
        
        # 1. Fetch the user's role from the DB
        role = session.exec(
            select(Role).where(Role.id == context.role_id) 
        ).first()

        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Role not found."
            )

        # 2. Extract granted permissions
        granted_permissions = [perm.name for perm in role.permissions]

        # 3. Evaluate access
        if required_permission not in granted_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {required_permission}"
            )
            
        return context

    return permission_checker