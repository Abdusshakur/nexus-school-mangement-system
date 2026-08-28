from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from backend.app.models import (
    AssessmentSchemeStatus,
    AssessmentScoreStatus,
    AssessmentStatus,
    AssessmentType,
    ResultSubmissionStatus,
    OfficialResultStatus,
)


class AssessmentBase(BaseModel):
    name: str = Field(min_length=1)
    type: AssessmentType = AssessmentType.OTHER
    max_score: float = Field(gt=0)
    weight: float = Field(ge=0, le=100)
    sequence: int = Field(default=1, ge=1)
    is_required: bool = True
    status: AssessmentStatus = AssessmentStatus.ACTIVE


class AssessmentCreate(AssessmentBase):
    pass


class AssessmentUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    type: Optional[AssessmentType] = None
    max_score: Optional[float] = Field(default=None, gt=0)
    weight: Optional[float] = Field(default=None, ge=0, le=100)
    sequence: Optional[int] = Field(default=None, ge=1)
    is_required: Optional[bool] = None
    status: Optional[AssessmentStatus] = None


class AssessmentResponse(AssessmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    scheme_id: UUID
    created_at: datetime
    updated_at: datetime


class AssessmentSchemeCreate(BaseModel):
    academic_session_id: UUID
    academic_term_id: UUID
    class_id: UUID
    subject_id: UUID
    name: str = Field(min_length=1)
    total_weight: float = Field(default=100.0, ge=0, le=100)
    status: AssessmentSchemeStatus = AssessmentSchemeStatus.DRAFT


class AssessmentSchemeUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    total_weight: Optional[float] = Field(default=None, ge=0, le=100)
    status: Optional[AssessmentSchemeStatus] = None


class AssessmentSchemeResponse(BaseModel):
    id: UUID
    school_id: UUID
    academic_session_id: UUID
    academic_term_id: UUID
    class_id: UUID
    class_name: str
    subject_id: UUID
    subject_name: str
    academic_session_name: str
    academic_term_name: str
    name: str
    total_weight: float
    status: AssessmentSchemeStatus
    version: int
    created_at: datetime
    updated_at: datetime


class GradingScaleCreate(BaseModel):
    name: str = Field(min_length=1)
    academic_session_id: Optional[UUID] = None
    academic_term_id: Optional[UUID] = None
    version: int = Field(default=1, ge=1)
    is_active: bool = True


class GradingScaleUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1)
    is_active: Optional[bool] = None


class GradingScaleResponse(BaseModel):
    id: UUID
    school_id: UUID
    name: str
    academic_session_id: Optional[UUID]
    academic_term_id: Optional[UUID]
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class GradingScaleRuleCreate(BaseModel):
    grade: str = Field(min_length=1)
    minimum_percentage: float = Field(ge=0, le=100)
    maximum_percentage: float = Field(ge=0, le=100)
    remark: Optional[str] = None

    @model_validator(mode="after")
    def validate_range(self):
        if self.minimum_percentage > self.maximum_percentage:
            raise ValueError("minimum_percentage cannot exceed maximum_percentage")
        return self


class GradingScaleRuleUpdate(BaseModel):
    grade: Optional[str] = Field(default=None, min_length=1)
    minimum_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    maximum_percentage: Optional[float] = Field(default=None, ge=0, le=100)
    remark: Optional[str] = None


class GradingScaleRuleResponse(BaseModel):
    id: UUID
    grading_scale_id: UUID
    grade: str
    minimum_percentage: float
    maximum_percentage: float
    remark: Optional[str]


class AssessmentScoreInput(BaseModel):
    student_id: UUID
    score: Optional[float] = Field(default=None, ge=0)
    score_status: AssessmentScoreStatus = AssessmentScoreStatus.PRESENT
    remarks: Optional[str] = None

    @model_validator(mode="after")
    def validate_score_status(self):
        if self.score_status == AssessmentScoreStatus.PRESENT and self.score is None:
            raise ValueError("A present student must have a score.")
        if self.score_status != AssessmentScoreStatus.PRESENT and self.score is not None:
            raise ValueError("Absent, excused, or missing students cannot have a score.")
        return self


class AssessmentScoresRequest(BaseModel):
    scores: List[AssessmentScoreInput] = Field(min_length=1)


class AssessmentScoreResponse(AssessmentScoreInput):
    id: UUID
    submission_id: UUID
    created_at: datetime
    updated_at: datetime


class AssessmentSubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    assessment_id: UUID
    school_id: UUID
    academic_session_id: UUID
    academic_term_id: UUID
    class_id: UUID
    subject_id: UUID
    teacher_id: UUID
    submitted_by: UUID
    assessment_name: str
    teacher_name: str
    class_name: str
    subject_name: str
    academic_session_name: str
    academic_term_name: str
    status: ResultSubmissionStatus
    submitted_at: Optional[datetime]
    reviewed_by: Optional[UUID]
    reviewed_at: Optional[datetime]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime


class AssessmentCatalogItem(BaseModel):
    id: UUID
    scheme_id: UUID
    name: str
    type: AssessmentType
    max_score: float
    weight: float
    sequence: int
    is_required: bool
    status: AssessmentStatus
    submission_id: Optional[UUID] = None
    submission_status: Optional[ResultSubmissionStatus] = None


class AssessmentRosterStudent(BaseModel):
    student_id: UUID
    admission_number: str
    first_name: str
    last_name: str
    score: Optional[float] = None
    score_status: AssessmentScoreStatus = AssessmentScoreStatus.MISSING
    remarks: Optional[str] = None


class AssessmentRosterResponse(BaseModel):
    assessment: AssessmentResponse
    submission: Optional[AssessmentSubmissionResponse] = None
    students: List[AssessmentRosterStudent]


class SubmissionDecisionRequest(BaseModel):
    reason: Optional[str] = None


class SubjectResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_id: UUID
    academic_session_id: UUID
    academic_term_id: UUID
    class_id: UUID
    subject_id: UUID
    student_id: UUID
    grading_scale_id: UUID
    student_name: str
    admission_number: str
    class_name: str
    subject_name: str
    academic_session_name: str
    academic_term_name: str
    total_score: float
    percentage: float
    grade: str
    status: OfficialResultStatus
    calculated_at: datetime
    created_at: datetime
    updated_at: datetime


class TermResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_id: UUID
    academic_session_id: UUID
    academic_term_id: UUID
    class_id: UUID
    student_id: UUID
    grading_scale_id: UUID
    student_name: str
    admission_number: str
    class_name: str
    academic_session_name: str
    academic_term_name: str
    total_score: float
    average_score: float
    grade: str
    status: OfficialResultStatus
    published_at: Optional[datetime]
    locked_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class TermResultDetailResponse(BaseModel):
    term_result: TermResultResponse
    subject_results: List[SubjectResultResponse]


class PublicationResponse(BaseModel):
    term_id: UUID
    status: OfficialResultStatus
    students_processed: int
    subjects_calculated: int
