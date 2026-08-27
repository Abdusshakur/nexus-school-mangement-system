import hashlib
import secrets
from datetime import datetime, timezone
from typing import Tuple

def generate_secure_qr_token() -> Tuple[str, str]:
    """
    Generates a cryptographically secure random token and its SHA-256 hash.
    
    Returns:
        Tuple[str, str]: (raw_token_for_qr, token_hash_for_db)
    """
    # Generate 32 bytes of cryptographic randomness (64 hex characters)
    # This provides 256 bits of entropy, making it impossible to guess.
    raw_token = secrets.token_hex(32)
    
    # Hash it for the database
    token_hash = hash_token(raw_token)
    
    return raw_token, token_hash

def hash_token(token: str) -> str:
    """
    Hashes the raw token using SHA-256.
    
    We use SHA-256 instead of bcrypt here because:
    1. The token already has massive entropy (256 bits).
    2. The token expires in ~5 minutes.
    3. We need extremely fast validation when 50 teachers scan at 7:55 AM.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def is_token_expired(expires_at: datetime) -> bool:
    """Checks if the QR token's expiration time has passed."""
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > expires_at
