# auth_utils.py
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")


# SECURITY CONFIGURATION
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    """Converts a plain-text password into a secure hash using native bcrypt."""
    # Convert string password to bytes
    password_bytes = password.encode('utf-8')
    # Generate a salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    # Decode back to a standard string to save in MongoDB safely
    return hashed_bytes.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compares a plain password against a hash using native bcrypt."""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # bcrypt automatically checks the salt embedded inside the hash
    return bcrypt.checkpw(password_bytes, hashed_bytes)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates an encrypted JWT access token."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# This tells FastAPI where to look for the token (the token path we created)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> str:
    """Decodes the JWT token and extracts the authenticated user's ID."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        return user_id
    except Exception:
        raise credentials_exception
    
# 1. Base Helper: Decodes token and returns the full payload dictionary
def get_current_token_payload(token: str = Depends(oauth2_scheme)) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Decode using our shared Secret Key and Algorithm
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise credentials_exception

# 2. RBAC Guard Factory: Generates a custom dependency tailored to specific roles
class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        # Store the list of roles permitted to access an endpoint
        self.allowed_roles = allowed_roles

    def __call__(self, payload: dict = Depends(get_current_token_payload)):
        # Extract the user's role straight from the decrypted token payload
        user_role = payload.get("role")
        
        # Lockout Check: If their role is not in the allowed list, block them!
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )
        
        # If permitted, return the payload (useful if a route needs their user_id)
        return payload