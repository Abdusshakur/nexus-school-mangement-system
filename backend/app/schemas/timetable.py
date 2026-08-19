from pydantic import BaseModel, model_validator
from typing import List
from datetime import time
from uuid import UUID
from backend.app.models import DayOfWeek

from pydantic import BaseModel, model_validator
from typing import List
from datetime import time
from uuid import UUID
from backend.app.models import DayOfWeek

class TimetableEntryCreate(BaseModel):
    term_id: UUID  # 👈 Changed from academic_term: str
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

class TimetableEntryResponse(BaseModel):
    id: UUID
    day_of_week: DayOfWeek
    start_time: time
    end_time: time

    term_id: UUID # 👈 Changed from academic_term: str
    term_name: str # 👈 Added for easy frontend rendering!
    # Flattened data for easy frontend rendering
    class_id: UUID
    class_name: str
    subject_id: UUID
    subject_name: str
    teacher_id: UUID
    teacher_name: str


# Also, ensure your Bulk request schema looks like this:
class BulkTimetableRequest(BaseModel):
    term_id: UUID # 👈 Changed here too
    class_id: UUID
    entries: List[TimetableEntryCreate]
