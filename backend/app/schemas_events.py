from datetime import datetime, timezone
from typing import Any, Dict

from pydantic import BaseModel, Field


class BaseEvent(BaseModel):
    event_type: str
    schema_version: int = 1
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payload: Dict[str, Any]
