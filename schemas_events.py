# schemas_events.py
from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime, timezone

class BaseEvent(BaseModel):
    event_type: str        # e.g., "student_registered", "attendance_marked"
    schema_version: int = 1
    timestamp: datetime = datetime.now(timezone.utc)
    payload: Dict[str, Any] # A flexible dictionary to hold any custom event data