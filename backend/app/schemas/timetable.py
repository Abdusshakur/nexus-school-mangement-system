from pydantic import BaseModel, model_validator
from typing import List
from datetime import time
from uuid import UUID
from backend.app.models import DayOfWeek

class TimetableEntryCreate(BaseModel):
    term_id: UUID  
    class_id: UUID
    subject_id: UUID
    teacher_id: UUID
    day_of_week: DayOfWeek
    start_time: time
    end_time: time

    @model_validator(mode='after')
    def validate_time_logic(self):
        if self.start_time >= self.end_time:
            raise ValueError("Start time must be strictly before end time.")
        return self

# ------------------------------------------------------------------
# NEW: Optimized Schema for Bulk Inserts
# ------------------------------------------------------------------

class BulkTimetableEntryCreate(BaseModel):
    class_id: UUID  # 👈 Moved from top-level to entry-level
    subject_id: UUID
    teacher_id: UUID
    day_of_week: DayOfWeek
    start_time: time
    end_time: time

    @model_validator(mode='after')
    def validate_time_logic(self):
        if self.start_time >= self.end_time:
            raise ValueError("Start time must be strictly before end time.")
        return self

class BulkTimetableRequest(BaseModel):
    term_id: UUID # 👈 Kept at the top level (the grid is always for one term)
    entries: List[BulkTimetableEntryCreate]


# ------------------------------------------------------------------
# Response Schema
# ------------------------------------------------------------------
class TimetableEntryResponse(BaseModel):
    id: UUID
    day_of_week: DayOfWeek
    start_time: time
    end_time: time

    term_id: UUID 
    term_name: str 
    # Flattened data for easy frontend rendering
    class_id: UUID
    class_name: str
    subject_id: UUID
    subject_name: str
    teacher_id: UUID
    teacher_name: str