from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from backend.app.core.auth_utils import CurrentContext, require_permission
from backend.app.db.database import get_session
from backend.app.models import (
    AcademicSession,
    AcademicTerm,
    ActivityLog,
    Assessment,
    AssessmentScore,
    AssessmentScoreStatus,
    AssessmentScheme,
    AssessmentSchemeStatus,
    AssessmentStatus,
    AssessmentSubmission,
    AssignmentStatus,
    EnrollmentStatus,
    GradingScale,
    GradingScaleRule,
    OfficialResultStatus,
    SchoolClass,
    StudentEnrollment,
    StudentProfile,
    Subject,
    TeacherAssignment,
    TeacherProfile,
    SubjectResult,
    TermResult,
    User,
    ResultSubmissionStatus,
)
from backend.app.schemas.results import (
    AssessmentCreate,
    AssessmentResponse,
    AssessmentSchemeCreate,
    AssessmentSchemeResponse,
    AssessmentSchemeUpdate,
    AssessmentUpdate,
    GradingScaleCreate,
    GradingScaleResponse,
    GradingScaleRuleCreate,
    GradingScaleRuleResponse,
    GradingScaleRuleUpdate,
    GradingScaleUpdate,
    AssessmentCatalogItem,
    AssessmentRosterResponse,
    AssessmentRosterStudent,
    AssessmentScoreInput,
    AssessmentScoresRequest,
    AssessmentSubmissionResponse,
    SubmissionDecisionRequest,
    PublicationResponse,
    SubjectResultResponse,
    TermResultDetailResponse,
    TermResultResponse,
)
from backend.app.routers.teacher_context import get_active_term_and_session, get_current_teacher_profile
from backend.app.routers.attendance import verify_teacher_class_access


router = APIRouter(prefix="/results", tags=["Results Configuration"])


def _get_scheme(scheme_id: UUID, school_id: UUID, session: Session) -> AssessmentScheme:
    scheme = session.exec(
        select(AssessmentScheme).where(
            AssessmentScheme.id == scheme_id,
            AssessmentScheme.school_id == school_id,
        )
    ).first()
    if not scheme:
        raise HTTPException(status_code=404, detail="Assessment scheme not found.")
    return scheme


def _get_assessment(assessment_id: UUID, school_id: UUID, session: Session) -> Assessment:
    assessment = session.exec(
        select(Assessment)
        .join(AssessmentScheme, Assessment.scheme_id == AssessmentScheme.id)
        .where(
            Assessment.id == assessment_id,
            AssessmentScheme.school_id == school_id,
        )
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")
    return assessment


def _get_scheme_context(payload: AssessmentSchemeCreate, school_id: UUID, session: Session):
    academic_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.id == payload.academic_session_id,
            AcademicSession.school_id == school_id,
        )
    ).first()
    if not academic_session:
        raise HTTPException(status_code=404, detail="Academic session not found.")

    academic_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.id == payload.academic_term_id,
            AcademicTerm.school_id == school_id,
            AcademicTerm.session_id == academic_session.id,
        )
    ).first()
    school_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == payload.class_id,
            SchoolClass.school_id == school_id,
        )
    ).first()
    subject = session.exec(
        select(Subject).where(
            Subject.id == payload.subject_id,
            Subject.school_id == school_id,
        )
    ).first()

    if not academic_term:
        raise HTTPException(status_code=404, detail="Academic term not found for this session.")
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found.")
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    return academic_session, academic_term, school_class, subject


def _ensure_draft(scheme: AssessmentScheme):
    if scheme.status != AssessmentSchemeStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only draft assessment schemes can be modified.",
        )


def _validate_scheme_weights(scheme: AssessmentScheme, session: Session):
    assessments = session.exec(
        select(Assessment).where(Assessment.scheme_id == scheme.id, Assessment.status == AssessmentStatus.ACTIVE)
    ).all()
    total = sum(item.weight for item in assessments)
    if round(total, 6) != round(scheme.total_weight, 6):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Active assessment weights must total {scheme.total_weight:g}; current total is {total:g}.",
        )


def _validate_rule_overlap(
    grading_scale_id: UUID,
    minimum: float,
    maximum: float,
    session: Session,
    exclude_id: Optional[UUID] = None,
):
    rules = session.exec(
        select(GradingScaleRule).where(GradingScaleRule.grading_scale_id == grading_scale_id)
    ).all()
    for rule in rules:
        if exclude_id and rule.id == exclude_id:
            continue
        if minimum <= rule.maximum_percentage and maximum >= rule.minimum_percentage:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Grade range overlaps with the existing '{rule.grade}' range.",
            )


@router.post("/schemes", response_model=AssessmentSchemeResponse, status_code=status.HTTP_201_CREATED)
def create_assessment_scheme(
    payload: AssessmentSchemeCreate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    """Create a draft assessment scheme for one subject and class context."""
    if payload.status != AssessmentSchemeStatus.DRAFT:
        raise HTTPException(status_code=400, detail="New assessment schemes must start as DRAFT.")
    academic_session, academic_term, school_class, subject = _get_scheme_context(
        payload, context.school_id, session
    )
    existing = session.exec(
        select(AssessmentScheme).where(
            AssessmentScheme.school_id == context.school_id,
            AssessmentScheme.academic_session_id == payload.academic_session_id,
            AssessmentScheme.academic_term_id == payload.academic_term_id,
            AssessmentScheme.class_id == payload.class_id,
            AssessmentScheme.subject_id == payload.subject_id,
            AssessmentScheme.name == payload.name.strip(),
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An assessment scheme with this name already exists for this context.")

    scheme = AssessmentScheme(
        school_id=context.school_id,
        academic_session_id=academic_session.id,
        academic_term_id=academic_term.id,
        class_id=school_class.id,
        subject_id=subject.id,
        name=payload.name.strip(),
        class_name=school_class.name,
        subject_name=subject.name,
        academic_session_name=academic_session.name,
        academic_term_name=academic_term.name,
        total_weight=payload.total_weight,
        status=AssessmentSchemeStatus.DRAFT,
    )
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme


@router.get("/schemes", response_model=List[AssessmentSchemeResponse])
def list_assessment_schemes(
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    return session.exec(
        select(AssessmentScheme)
        .where(AssessmentScheme.school_id == context.school_id)
        .order_by(AssessmentScheme.created_at.desc())
    ).all()


@router.get("/schemes/{scheme_id}", response_model=AssessmentSchemeResponse)
def get_assessment_scheme(
    scheme_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    return _get_scheme(scheme_id, context.school_id, session)


@router.patch("/schemes/{scheme_id}", response_model=AssessmentSchemeResponse)
def update_assessment_scheme(
    scheme_id: UUID,
    payload: AssessmentSchemeUpdate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    scheme = _get_scheme(scheme_id, context.school_id, session)
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one scheme field is required.")
    if scheme.status != AssessmentSchemeStatus.DRAFT and set(update_data) != {"status"}:
        _ensure_draft(scheme)
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
        if not update_data["name"]:
            raise HTTPException(status_code=400, detail="Scheme name cannot be blank.")
    if update_data.get("status") == AssessmentSchemeStatus.ACTIVE:
        _validate_scheme_weights(scheme, session)
    for field, value in update_data.items():
        setattr(scheme, field, value)
    scheme.updated_at = datetime.now(timezone.utc)
    session.add(scheme)
    session.commit()
    session.refresh(scheme)
    return scheme


@router.post("/schemes/{scheme_id}/assessments", response_model=AssessmentResponse, status_code=status.HTTP_201_CREATED)
def create_assessment(
    scheme_id: UUID,
    payload: AssessmentCreate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    scheme = _get_scheme(scheme_id, context.school_id, session)
    _ensure_draft(scheme)
    name = payload.name.strip()
    existing = session.exec(
        select(Assessment).where(Assessment.scheme_id == scheme.id, Assessment.name == name)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An assessment with this name already exists in the scheme.")
    current_total = sum(item.weight for item in session.exec(
        select(Assessment).where(Assessment.scheme_id == scheme.id, Assessment.status == AssessmentStatus.ACTIVE)
    ).all())
    if current_total + payload.weight > scheme.total_weight:
        raise HTTPException(status_code=400, detail="Assessment weights cannot exceed the scheme total weight.")
    assessment = Assessment(scheme_id=scheme.id, **payload.model_dump(exclude={"name"}), name=name)
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment


@router.get("/schemes/{scheme_id}/assessments", response_model=List[AssessmentResponse])
def list_assessments(
    scheme_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    scheme = _get_scheme(scheme_id, context.school_id, session)
    return session.exec(select(Assessment).where(Assessment.scheme_id == scheme.id).order_by(Assessment.sequence)).all()


@router.patch("/assessments/{assessment_id}", response_model=AssessmentResponse)
def update_assessment(
    assessment_id: UUID,
    payload: AssessmentUpdate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    assessment = _get_assessment(assessment_id, context.school_id, session)
    scheme = _get_scheme(assessment.scheme_id, context.school_id, session)
    _ensure_draft(scheme)
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one assessment field is required.")
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
        if not update_data["name"]:
            raise HTTPException(status_code=400, detail="Assessment name cannot be blank.")
        duplicate = session.exec(select(Assessment).where(
            Assessment.scheme_id == scheme.id,
            Assessment.name == update_data["name"],
            Assessment.id != assessment.id,
        )).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="An assessment with this name already exists in the scheme.")
    if "weight" in update_data:
        other_total = sum(item.weight for item in session.exec(select(Assessment).where(
            Assessment.scheme_id == scheme.id,
            Assessment.status == AssessmentStatus.ACTIVE,
            Assessment.id != assessment.id,
        )).all())
        effective_status = update_data.get("status", assessment.status)
        if effective_status == AssessmentStatus.ACTIVE and other_total + update_data["weight"] > scheme.total_weight:
            raise HTTPException(status_code=400, detail="Assessment weights cannot exceed the scheme total weight.")
    for field, value in update_data.items():
        setattr(assessment, field, value)
    assessment.updated_at = datetime.now(timezone.utc)
    session.add(assessment)
    session.commit()
    session.refresh(assessment)
    return assessment


@router.post("/grading-scales", response_model=GradingScaleResponse, status_code=status.HTTP_201_CREATED)
def create_grading_scale(
    payload: GradingScaleCreate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    if payload.academic_term_id and not payload.academic_session_id:
        raise HTTPException(status_code=400, detail="academic_session_id is required when academic_term_id is provided.")
    if payload.academic_session_id:
        academic_session = session.exec(select(AcademicSession).where(
            AcademicSession.id == payload.academic_session_id,
            AcademicSession.school_id == context.school_id,
        )).first()
        if not academic_session:
            raise HTTPException(status_code=404, detail="Academic session not found.")
        if payload.academic_term_id and not session.exec(select(AcademicTerm).where(
            AcademicTerm.id == payload.academic_term_id,
            AcademicTerm.school_id == context.school_id,
            AcademicTerm.session_id == payload.academic_session_id,
        )).first():
            raise HTTPException(status_code=404, detail="Academic term not found for this session.")
    existing = session.exec(select(GradingScale).where(
        GradingScale.school_id == context.school_id,
        GradingScale.name == payload.name.strip(),
        GradingScale.version == payload.version,
    )).first()
    if existing:
        raise HTTPException(status_code=400, detail="This grading scale version already exists.")
    scale = GradingScale(
        school_id=context.school_id,
        **payload.model_dump(exclude={"name"}),
        name=payload.name.strip(),
    )
    session.add(scale)
    session.commit()
    session.refresh(scale)
    return scale


@router.get("/grading-scales", response_model=List[GradingScaleResponse])
def list_grading_scales(
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    return session.exec(select(GradingScale).where(GradingScale.school_id == context.school_id).order_by(GradingScale.name, GradingScale.version)).all()


@router.patch("/grading-scales/{scale_id}", response_model=GradingScaleResponse)
def update_grading_scale(
    scale_id: UUID,
    payload: GradingScaleUpdate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    scale = session.exec(select(GradingScale).where(
        GradingScale.id == scale_id,
        GradingScale.school_id == context.school_id,
    )).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Grading scale not found.")
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one grading scale field is required.")
    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()
        if not update_data["name"]:
            raise HTTPException(status_code=400, detail="Grading scale name cannot be blank.")
    for field, value in update_data.items():
        setattr(scale, field, value)
    scale.updated_at = datetime.now(timezone.utc)
    session.add(scale)
    session.commit()
    session.refresh(scale)
    return scale


@router.post("/grading-scales/{scale_id}/rules", response_model=GradingScaleRuleResponse, status_code=status.HTTP_201_CREATED)
def create_grading_rule(
    scale_id: UUID,
    payload: GradingScaleRuleCreate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    scale = session.exec(select(GradingScale).where(
        GradingScale.id == scale_id,
        GradingScale.school_id == context.school_id,
    )).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Grading scale not found.")
    duplicate = session.exec(select(GradingScaleRule).where(
        GradingScaleRule.grading_scale_id == scale.id,
        GradingScaleRule.grade == payload.grade.strip(),
    )).first()
    if duplicate:
        raise HTTPException(status_code=400, detail="This grade already exists in the grading scale.")
    _validate_rule_overlap(scale.id, payload.minimum_percentage, payload.maximum_percentage, session)
    rule = GradingScaleRule(grading_scale_id=scale.id, grade=payload.grade.strip(), **payload.model_dump(exclude={"grade"}))
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule


@router.patch("/grading-rules/{rule_id}", response_model=GradingScaleRuleResponse)
def update_grading_rule(
    rule_id: UUID,
    payload: GradingScaleRuleUpdate,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    rule = session.exec(
        select(GradingScaleRule)
        .join(GradingScale, GradingScaleRule.grading_scale_id == GradingScale.id)
        .where(GradingScaleRule.id == rule_id, GradingScale.school_id == context.school_id)
    ).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Grading rule not found.")
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one grading rule field is required.")
    if "grade" in update_data:
        update_data["grade"] = update_data["grade"].strip()
        duplicate = session.exec(select(GradingScaleRule).where(
            GradingScaleRule.grading_scale_id == rule.grading_scale_id,
            GradingScaleRule.grade == update_data["grade"],
            GradingScaleRule.id != rule.id,
        )).first()
        if duplicate:
            raise HTTPException(status_code=400, detail="This grade already exists in the grading scale.")
    minimum = update_data.get("minimum_percentage", rule.minimum_percentage)
    maximum = update_data.get("maximum_percentage", rule.maximum_percentage)
    if minimum > maximum:
        raise HTTPException(status_code=400, detail="minimum_percentage cannot exceed maximum_percentage.")
    _validate_rule_overlap(rule.grading_scale_id, minimum, maximum, session, rule.id)
    for field, value in update_data.items():
        setattr(rule, field, value)
    session.add(rule)
    session.commit()
    session.refresh(rule)
    return rule


def _get_active_assessment(assessment_id: UUID, school_id: UUID, session: Session):
    active_session, active_term = get_active_term_and_session(school_id, session)
    result = session.exec(
        select(Assessment, AssessmentScheme)
        .join(AssessmentScheme, Assessment.scheme_id == AssessmentScheme.id)
        .where(
            Assessment.id == assessment_id,
            Assessment.status == AssessmentStatus.ACTIVE,
            AssessmentScheme.school_id == school_id,
            AssessmentScheme.academic_session_id == active_session.id,
            AssessmentScheme.academic_term_id == active_term.id,
            AssessmentScheme.status == AssessmentSchemeStatus.ACTIVE,
        )
    ).first()
    if not result:
        raise HTTPException(status_code=404, detail="Active assessment not found for the current academic context.")
    return result[0], result[1], active_session, active_term


def _get_teacher_assessment_context(
    assessment_id: UUID,
    context: CurrentContext,
    session: Session,
):
    assessment, scheme, active_session, active_term = _get_active_assessment(
        assessment_id, context.school_id, session
    )
    teacher, teacher_user = get_current_teacher_profile(context, session)
    verify_teacher_class_access(
        teacher.id,
        scheme.class_id,
        context.school_id,
        session,
        active_session.id,
        active_term.id,
    )
    assignment = session.exec(
        select(TeacherAssignment).where(
            TeacherAssignment.teacher_id == teacher.id,
            TeacherAssignment.school_id == context.school_id,
            TeacherAssignment.session_id == active_session.id,
            TeacherAssignment.term_id == active_term.id,
            TeacherAssignment.class_id == scheme.class_id,
            TeacherAssignment.subject_id == scheme.subject_id,
            TeacherAssignment.status == AssignmentStatus.ACTIVE,
        )
    ).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="You are not authorized to manage this subject for the class.")
    return assessment, scheme, active_session, active_term, teacher, teacher_user


def _get_submission(submission_id: UUID, school_id: UUID, session: Session) -> AssessmentSubmission:
    submission = session.exec(
        select(AssessmentSubmission).where(
            AssessmentSubmission.id == submission_id,
            AssessmentSubmission.school_id == school_id,
        )
    ).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Assessment submission not found.")
    return submission


def _submission_roster(
    assessment: Assessment,
    submission: Optional[AssessmentSubmission],
    scheme: AssessmentScheme,
    session: Session,
) -> AssessmentRosterResponse:
    students = session.exec(
        select(StudentProfile)
        .join(StudentEnrollment, StudentEnrollment.student_id == StudentProfile.id)
        .where(
            StudentEnrollment.school_id == scheme.school_id,
            StudentEnrollment.session_id == scheme.academic_session_id,
            StudentEnrollment.term_id == scheme.academic_term_id,
            StudentEnrollment.class_id == scheme.class_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            StudentProfile.school_id == scheme.school_id,
        )
        .order_by(StudentProfile.last_name, StudentProfile.first_name)
    ).all()
    score_map = {}
    if submission:
        score_map = {
            item.student_id: item
            for item in session.exec(
                select(AssessmentScore).where(AssessmentScore.submission_id == submission.id)
            ).all()
        }
    roster = []
    for student in students:
        saved = score_map.get(student.id)
        roster.append(
            AssessmentRosterStudent(
                student_id=student.id,
                admission_number=student.admission_number,
                first_name=student.first_name,
                last_name=student.last_name,
                score=saved.score if saved else None,
                score_status=saved.score_status if saved else AssessmentScoreStatus.MISSING,
                remarks=saved.remarks if saved else None,
            )
        )
    return AssessmentRosterResponse(
        assessment=assessment,
        submission=submission,
        students=roster,
    )


@router.get("/classes/{class_id}/subjects/{subject_id}/assessments", response_model=List[AssessmentCatalogItem])
def list_teacher_assessments(
    class_id: UUID,
    subject_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    active_session, active_term = get_active_term_and_session(context.school_id, session)
    teacher, _ = get_current_teacher_profile(context, session)
    verify_teacher_class_access(teacher.id, class_id, context.school_id, session, active_session.id, active_term.id)
    assignment = session.exec(select(TeacherAssignment).where(
        TeacherAssignment.teacher_id == teacher.id,
        TeacherAssignment.school_id == context.school_id,
        TeacherAssignment.session_id == active_session.id,
        TeacherAssignment.term_id == active_term.id,
        TeacherAssignment.class_id == class_id,
        TeacherAssignment.subject_id == subject_id,
        TeacherAssignment.status == AssignmentStatus.ACTIVE,
    )).first()
    if not assignment:
        raise HTTPException(status_code=403, detail="You are not authorized to manage this subject for the class.")
    schemes = session.exec(select(AssessmentScheme).where(
        AssessmentScheme.school_id == context.school_id,
        AssessmentScheme.academic_session_id == active_session.id,
        AssessmentScheme.academic_term_id == active_term.id,
        AssessmentScheme.class_id == class_id,
        AssessmentScheme.subject_id == subject_id,
        AssessmentScheme.status == AssessmentSchemeStatus.ACTIVE,
    )).all()
    assessments = []
    for scheme in schemes:
        for assessment in session.exec(select(Assessment).where(
            Assessment.scheme_id == scheme.id,
            Assessment.status == AssessmentStatus.ACTIVE,
        )).all():
            submission = session.exec(select(AssessmentSubmission).where(
                AssessmentSubmission.assessment_id == assessment.id,
                AssessmentSubmission.school_id == context.school_id,
            )).first()
            assessments.append(AssessmentCatalogItem(
                **assessment.model_dump(),
                submission_id=submission.id if submission else None,
                submission_status=submission.status if submission else None,
            ))
    return sorted(assessments, key=lambda item: item.sequence)


@router.get("/assessments/{assessment_id}/roster", response_model=AssessmentRosterResponse)
def get_assessment_roster(
    assessment_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    assessment, scheme, _, _, _, _ = _get_teacher_assessment_context(assessment_id, context, session)
    submission = session.exec(select(AssessmentSubmission).where(
        AssessmentSubmission.assessment_id == assessment.id,
        AssessmentSubmission.school_id == context.school_id,
    )).first()
    return _submission_roster(assessment, submission, scheme, session)


@router.post("/assessments/{assessment_id}/scores", response_model=AssessmentSubmissionResponse)
def save_assessment_scores(
    assessment_id: UUID,
    payload: AssessmentScoresRequest,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    assessment, scheme, active_session, active_term, teacher, teacher_user = _get_teacher_assessment_context(
        assessment_id, context, session
    )
    if len({item.student_id for item in payload.scores}) != len(payload.scores):
        raise HTTPException(status_code=400, detail="A student may appear only once per score submission.")
    enrolled_ids = set(session.exec(select(StudentEnrollment.student_id).where(
        StudentEnrollment.school_id == context.school_id,
        StudentEnrollment.session_id == active_session.id,
        StudentEnrollment.term_id == active_term.id,
        StudentEnrollment.class_id == scheme.class_id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE,
    )).all())
    for item in payload.scores:
        if item.student_id not in enrolled_ids:
            raise HTTPException(status_code=400, detail="Scores can only be saved for active students in this class.")
        if item.score is not None and item.score > assessment.max_score:
            raise HTTPException(status_code=400, detail=f"Score cannot exceed the assessment maximum of {assessment.max_score:g}.")

    submission = session.exec(select(AssessmentSubmission).where(
        AssessmentSubmission.assessment_id == assessment.id,
        AssessmentSubmission.school_id == context.school_id,
    )).first()
    if submission and submission.status not in {ResultSubmissionStatus.DRAFT, ResultSubmissionStatus.REJECTED}:
        raise HTTPException(status_code=409, detail="Submitted or approved scores cannot be edited.")
    if not submission:
        submission = AssessmentSubmission(
            assessment_id=assessment.id,
            school_id=context.school_id,
            academic_session_id=active_session.id,
            academic_term_id=active_term.id,
            class_id=scheme.class_id,
            subject_id=scheme.subject_id,
            teacher_id=teacher.id,
            submitted_by=teacher_user.id,
            assessment_name=assessment.name,
            teacher_name=f"{teacher.first_name} {teacher.last_name}",
            class_name=scheme.class_name,
            subject_name=scheme.subject_name,
            academic_session_name=scheme.academic_session_name,
            academic_term_name=scheme.academic_term_name,
        )
        session.add(submission)
        session.flush()
    else:
        submission.status = ResultSubmissionStatus.DRAFT
        submission.teacher_id = teacher.id
        submission.submitted_by = teacher_user.id
        submission.updated_at = datetime.now(timezone.utc)

    existing_scores = {
        item.student_id: item
        for item in session.exec(select(AssessmentScore).where(AssessmentScore.submission_id == submission.id)).all()
    }
    for item in payload.scores:
        saved = existing_scores.get(item.student_id)
        if not saved:
            saved = AssessmentScore(submission_id=submission.id, student_id=item.student_id)
        saved.score = item.score
        saved.score_status = item.score_status
        saved.remarks = item.remarks
        saved.updated_at = datetime.now(timezone.utc)
        session.add(saved)
    session.commit()
    session.refresh(submission)
    return submission


@router.post("/submissions/{submission_id}/submit", response_model=AssessmentSubmissionResponse)
def submit_assessment_submission(
    submission_id: UUID,
    context: CurrentContext = Depends(require_permission("result:write")),
    session: Session = Depends(get_session),
):
    submission = _get_submission(submission_id, context.school_id, session)
    if submission.status not in {ResultSubmissionStatus.DRAFT, ResultSubmissionStatus.REJECTED}:
        raise HTTPException(status_code=409, detail="Only draft or rejected submissions can be submitted.")
    assessment, scheme, active_session, active_term, teacher, teacher_user = _get_teacher_assessment_context(
        submission.assessment_id, context, session
    )
    if submission.class_id != scheme.class_id or submission.subject_id != scheme.subject_id:
        raise HTTPException(status_code=409, detail="Submission context no longer matches the active assessment.")
    enrolled_ids = set(session.exec(select(StudentEnrollment.student_id).where(
        StudentEnrollment.school_id == context.school_id,
        StudentEnrollment.session_id == active_session.id,
        StudentEnrollment.term_id == active_term.id,
        StudentEnrollment.class_id == scheme.class_id,
        StudentEnrollment.status == EnrollmentStatus.ACTIVE,
    )).all())
    saved_scores = {
        item.student_id: item
        for item in session.exec(select(AssessmentScore).where(AssessmentScore.submission_id == submission.id)).all()
    }
    missing = [student_id for student_id in enrolled_ids if student_id not in saved_scores or saved_scores[student_id].score_status == AssessmentScoreStatus.MISSING]
    if missing:
        raise HTTPException(status_code=400, detail=f"All active students must be scored or marked absent/excused. Missing: {len(missing)}.")
    for saved in saved_scores.values():
        if saved.score is not None and saved.score > assessment.max_score:
            raise HTTPException(status_code=400, detail="A saved score exceeds the assessment maximum.")
    submission.status = ResultSubmissionStatus.SUBMITTED
    submission.submitted_at = datetime.now(timezone.utc)
    submission.submitted_by = teacher_user.id
    submission.teacher_id = teacher.id
    submission.rejection_reason = None
    submission.updated_at = datetime.now(timezone.utc)
    session.add(submission)
    session.add(ActivityLog(
        school_id=context.school_id,
        activity_type="RESULT_SUBMITTED",
        message=f"{submission.assessment_name} submitted for {submission.class_name} - {submission.subject_name}.",
        performed_by=context.user_id,
    ))
    session.commit()
    session.refresh(submission)
    return submission


@router.get("/submissions", response_model=List[AssessmentSubmissionResponse])
def list_submissions(
    submission_status: Optional[ResultSubmissionStatus] = None,
    context: CurrentContext = Depends(require_permission("result:approve")),
    session: Session = Depends(get_session),
):
    statement = select(AssessmentSubmission).where(AssessmentSubmission.school_id == context.school_id)
    if submission_status:
        statement = statement.where(AssessmentSubmission.status == submission_status)
    return session.exec(statement.order_by(AssessmentSubmission.created_at.desc())).all()


@router.get("/submissions/{submission_id}", response_model=AssessmentRosterResponse)
def get_submission_for_review(
    submission_id: UUID,
    context: CurrentContext = Depends(require_permission("result:approve")),
    session: Session = Depends(get_session),
):
    submission = _get_submission(submission_id, context.school_id, session)
    assessment = session.get(Assessment, submission.assessment_id)
    scheme = session.get(AssessmentScheme, assessment.scheme_id) if assessment else None
    if scheme and scheme.school_id != context.school_id:
        scheme = None
    if not assessment or not scheme:
        raise HTTPException(status_code=404, detail="Assessment configuration not found.")
    return _submission_roster(assessment, submission, scheme, session)


def _review_submission(
    submission_id: UUID,
    context: CurrentContext,
    session: Session,
    new_status: ResultSubmissionStatus,
    reason: Optional[str] = None,
):
    submission = _get_submission(submission_id, context.school_id, session)
    if submission.status != ResultSubmissionStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Only submitted results can be reviewed.")
    if new_status == ResultSubmissionStatus.REJECTED and not reason:
        raise HTTPException(status_code=400, detail="A rejection reason is required.")
    submission.status = new_status
    submission.reviewed_by = context.user_id
    submission.reviewed_at = datetime.now(timezone.utc)
    submission.rejection_reason = reason.strip() if reason else None
    submission.updated_at = datetime.now(timezone.utc)
    session.add(submission)
    session.add(ActivityLog(
        school_id=context.school_id,
        activity_type=f"RESULT_{new_status.value}",
        message=f"{submission.assessment_name} {new_status.value.lower()} for {submission.class_name} - {submission.subject_name}.",
        performed_by=context.user_id,
    ))
    session.commit()
    session.refresh(submission)
    return submission


@router.post("/submissions/{submission_id}/approve", response_model=AssessmentSubmissionResponse)
def approve_submission(
    submission_id: UUID,
    context: CurrentContext = Depends(require_permission("result:approve")),
    session: Session = Depends(get_session),
):
    return _review_submission(submission_id, context, session, ResultSubmissionStatus.APPROVED)


@router.post("/submissions/{submission_id}/reject", response_model=AssessmentSubmissionResponse)
def reject_submission(
    submission_id: UUID,
    payload: SubmissionDecisionRequest,
    context: CurrentContext = Depends(require_permission("result:approve")),
    session: Session = Depends(get_session),
):
    return _review_submission(
        submission_id,
        context,
        session,
        ResultSubmissionStatus.REJECTED,
        payload.reason,
    )


def _get_term(term_id: UUID, school_id: UUID, session: Session):
    term = session.exec(select(AcademicTerm).where(
        AcademicTerm.id == term_id,
        AcademicTerm.school_id == school_id,
    )).first()
    if not term:
        raise HTTPException(status_code=404, detail="Academic term not found.")
    academic_session = session.exec(select(AcademicSession).where(
        AcademicSession.id == term.session_id,
        AcademicSession.school_id == school_id,
    )).first()
    if not academic_session:
        raise HTTPException(status_code=404, detail="Academic session not found for this term.")
    return academic_session, term


def _get_result_grading_scale(
    school_id: UUID,
    academic_session_id: UUID,
    academic_term_id: UUID,
    session: Session,
) -> GradingScale:
    scales = session.exec(select(GradingScale).where(
        GradingScale.school_id == school_id,
        GradingScale.is_active == True,
    )).all()
    ranked = sorted(
        scales,
        key=lambda scale: (
            scale.academic_session_id == academic_session_id and scale.academic_term_id == academic_term_id,
            scale.academic_session_id == academic_session_id and scale.academic_term_id is None,
            scale.academic_session_id is None and scale.academic_term_id is None,
        ),
        reverse=True,
    )
    if not ranked:
        raise HTTPException(status_code=400, detail="No active grading scale is configured for this academic context.")
    scale = ranked[0]
    if scale.academic_session_id not in {None, academic_session_id} or scale.academic_term_id not in {None, academic_term_id}:
        raise HTTPException(status_code=400, detail="No active grading scale is configured for this academic context.")
    return scale


def _grade_for_percentage(percentage: float, scale_id: UUID, session: Session) -> str:
    rules = session.exec(select(GradingScaleRule).where(
        GradingScaleRule.grading_scale_id == scale_id,
    )).all()
    for rule in rules:
        if rule.minimum_percentage <= percentage <= rule.maximum_percentage:
            return rule.grade
    raise HTTPException(status_code=400, detail=f"No grading rule matches percentage {percentage:.2f}.")


def _active_enrollments_for_class(
    school_id: UUID,
    class_id: UUID,
    session_id: UUID,
    term_id: UUID,
    session: Session,
):
    return session.exec(
        select(StudentProfile)
        .join(StudentEnrollment, StudentEnrollment.student_id == StudentProfile.id)
        .where(
            StudentEnrollment.school_id == school_id,
            StudentEnrollment.class_id == class_id,
            StudentEnrollment.session_id == session_id,
            StudentEnrollment.term_id == term_id,
            StudentEnrollment.status == EnrollmentStatus.ACTIVE,
            StudentProfile.school_id == school_id,
        )
        .order_by(StudentProfile.last_name, StudentProfile.first_name)
    ).all()


def _calculate_term_results(term_id: UUID, school_id: UUID, session: Session):
    academic_session, academic_term = _get_term(term_id, school_id, session)
    grading_scale = _get_result_grading_scale(
        school_id, academic_session.id, academic_term.id, session
    )
    schemes = session.exec(select(AssessmentScheme).where(
        AssessmentScheme.school_id == school_id,
        AssessmentScheme.academic_session_id == academic_session.id,
        AssessmentScheme.academic_term_id == academic_term.id,
        AssessmentScheme.status == AssessmentSchemeStatus.ACTIVE,
    )).all()
    if not schemes:
        raise HTTPException(status_code=400, detail="No active assessment schemes are configured for this term.")

    approved_submissions = {}
    for scheme in schemes:
        assessments = session.exec(select(Assessment).where(
            Assessment.scheme_id == scheme.id,
            Assessment.status == AssessmentStatus.ACTIVE,
        )).all()
        if not assessments:
            raise HTTPException(status_code=400, detail=f"Assessment scheme '{scheme.name}' has no active assessments.")
        for assessment in assessments:
            submission = session.exec(select(AssessmentSubmission).where(
                AssessmentSubmission.assessment_id == assessment.id,
                AssessmentSubmission.school_id == school_id,
            )).first()
            if assessment.is_required and (
                not submission or submission.status != ResultSubmissionStatus.APPROVED
            ):
                raise HTTPException(
                    status_code=400,
                    detail=f"Required assessment '{assessment.name}' for {scheme.class_name} - {scheme.subject_name} is not approved.",
                )
            if submission and submission.status == ResultSubmissionStatus.APPROVED:
                approved_submissions[assessment.id] = submission

    existing_term_results = session.exec(select(TermResult).where(
        TermResult.school_id == school_id,
        TermResult.academic_session_id == academic_session.id,
        TermResult.academic_term_id == academic_term.id,
    )).all()
    if any(item.status == OfficialResultStatus.LOCKED for item in existing_term_results):
        raise HTTPException(status_code=409, detail="Locked results cannot be recalculated.")
    if any(item.status == OfficialResultStatus.PUBLISHED for item in existing_term_results):
        raise HTTPException(status_code=409, detail="This term has already been published.")

    term_subjects = {}
    subject_count = 0
    for scheme in schemes:
        assessments = session.exec(select(Assessment).where(
            Assessment.scheme_id == scheme.id,
            Assessment.status == AssessmentStatus.ACTIVE,
        )).all()
        students = _active_enrollments_for_class(
            school_id, scheme.class_id, academic_session.id, academic_term.id, session
        )
        for student in students:
            weighted_total = 0.0
            for assessment in assessments:
                submission = approved_submissions.get(assessment.id)
                score = None
                if submission:
                    saved = session.exec(select(AssessmentScore).where(
                        AssessmentScore.submission_id == submission.id,
                        AssessmentScore.student_id == student.id,
                    )).first()
                    if saved and saved.score_status == AssessmentScoreStatus.PRESENT:
                        score = saved.score
                if score is not None:
                    weighted_total += (score / assessment.max_score) * assessment.weight
            percentage = round(weighted_total, 2)
            result_key = (student.id, scheme.class_id, scheme.subject_id)
            subject_result = session.exec(select(SubjectResult).where(
                SubjectResult.school_id == school_id,
                SubjectResult.academic_session_id == academic_session.id,
                SubjectResult.academic_term_id == academic_term.id,
                SubjectResult.class_id == scheme.class_id,
                SubjectResult.subject_id == scheme.subject_id,
                SubjectResult.student_id == student.id,
            )).first()
            if subject_result and subject_result.status == OfficialResultStatus.LOCKED:
                raise HTTPException(status_code=409, detail="Locked subject results cannot be recalculated.")
            if not subject_result:
                subject_result = SubjectResult(
                    school_id=school_id,
                    academic_session_id=academic_session.id,
                    academic_term_id=academic_term.id,
                    class_id=scheme.class_id,
                    subject_id=scheme.subject_id,
                    student_id=student.id,
                    grading_scale_id=grading_scale.id,
                    student_name=f"{student.first_name} {student.last_name}",
                    admission_number=student.admission_number,
                    class_name=scheme.class_name,
                    subject_name=scheme.subject_name,
                    academic_session_name=scheme.academic_session_name,
                    academic_term_name=scheme.academic_term_name,
                )
            subject_result.grading_scale_id = grading_scale.id
            subject_result.total_score = percentage
            subject_result.percentage = percentage
            subject_result.grade = _grade_for_percentage(percentage, grading_scale.id, session)
            subject_result.status = OfficialResultStatus.PUBLISHED
            subject_result.calculated_at = datetime.now(timezone.utc)
            subject_result.updated_at = datetime.now(timezone.utc)
            session.add(subject_result)
            term_subjects.setdefault((student.id, scheme.class_id), []).append(subject_result)
            subject_count += 1

    session.flush()
    student_count = 0
    for (student_id, class_id), subject_results in term_subjects.items():
        first = subject_results[0]
        average = round(sum(item.percentage for item in subject_results) / len(subject_results), 2)
        term_result = session.exec(select(TermResult).where(
            TermResult.school_id == school_id,
            TermResult.academic_session_id == academic_session.id,
            TermResult.academic_term_id == academic_term.id,
            TermResult.class_id == class_id,
            TermResult.student_id == student_id,
        )).first()
        if term_result and term_result.status == OfficialResultStatus.LOCKED:
            raise HTTPException(status_code=409, detail="Locked term results cannot be recalculated.")
        if not term_result:
            term_result = TermResult(
                school_id=school_id,
                academic_session_id=academic_session.id,
                academic_term_id=academic_term.id,
                class_id=class_id,
                student_id=student_id,
                grading_scale_id=grading_scale.id,
                student_name=first.student_name,
                admission_number=first.admission_number,
                class_name=first.class_name,
                academic_session_name=first.academic_session_name,
                academic_term_name=first.academic_term_name,
            )
        term_result.grading_scale_id = grading_scale.id
        term_result.total_score = round(sum(item.total_score for item in subject_results), 2)
        term_result.average_score = average
        term_result.grade = _grade_for_percentage(average, grading_scale.id, session)
        term_result.status = OfficialResultStatus.PUBLISHED
        term_result.published_at = datetime.now(timezone.utc)
        term_result.updated_at = datetime.now(timezone.utc)
        session.add(term_result)
        student_count += 1
    return academic_session, academic_term, student_count, subject_count


def _published_term_detail(
    term_result: TermResult,
    school_id: UUID,
    session: Session,
) -> TermResultDetailResponse:
    subject_results = session.exec(select(SubjectResult).where(
        SubjectResult.school_id == school_id,
        SubjectResult.academic_session_id == term_result.academic_session_id,
        SubjectResult.academic_term_id == term_result.academic_term_id,
        SubjectResult.class_id == term_result.class_id,
        SubjectResult.student_id == term_result.student_id,
        SubjectResult.status.in_([OfficialResultStatus.PUBLISHED, OfficialResultStatus.LOCKED]),
    ).order_by(SubjectResult.subject_name)).all()
    return TermResultDetailResponse(
        term_result=TermResultResponse.model_validate(term_result),
        subject_results=[SubjectResultResponse.model_validate(item) for item in subject_results],
    )


@router.post("/terms/{term_id}/publish", response_model=PublicationResponse)
def publish_term_results(
    term_id: UUID,
    context: CurrentContext = Depends(require_permission("result:publish")),
    session: Session = Depends(get_session),
):
    _, term = _get_term(term_id, context.school_id, session)
    academic_session, academic_term, students_processed, subjects_calculated = _calculate_term_results(
        term.id, context.school_id, session
    )
    session.add(ActivityLog(
        school_id=context.school_id,
        activity_type="RESULT_PUBLISHED",
        message=f"Results published for {academic_session.name} - {academic_term.name}.",
        performed_by=context.user_id,
    ))
    session.commit()
    return PublicationResponse(
        term_id=term.id,
        status=OfficialResultStatus.PUBLISHED,
        students_processed=students_processed,
        subjects_calculated=subjects_calculated,
    )


@router.post("/terms/{term_id}/lock", response_model=PublicationResponse)
def lock_term_results(
    term_id: UUID,
    context: CurrentContext = Depends(require_permission("result:publish")),
    session: Session = Depends(get_session),
):
    _, term = _get_term(term_id, context.school_id, session)
    term_results = session.exec(select(TermResult).where(
        TermResult.school_id == context.school_id,
        TermResult.academic_term_id == term.id,
    )).all()
    if not term_results:
        raise HTTPException(status_code=400, detail="No published results exist for this term.")
    if any(item.status not in {OfficialResultStatus.PUBLISHED, OfficialResultStatus.LOCKED} for item in term_results):
        raise HTTPException(status_code=409, detail="All term results must be published before locking.")
    locked_at = datetime.now(timezone.utc)
    for item in term_results:
        item.status = OfficialResultStatus.LOCKED
        item.locked_at = item.locked_at or locked_at
        item.updated_at = locked_at
        session.add(item)
    subject_results = session.exec(select(SubjectResult).where(
        SubjectResult.school_id == context.school_id,
        SubjectResult.academic_term_id == term.id,
        SubjectResult.status == OfficialResultStatus.PUBLISHED,
    )).all()
    for item in subject_results:
        item.status = OfficialResultStatus.LOCKED
        item.updated_at = locked_at
        session.add(item)
    session.add(ActivityLog(
        school_id=context.school_id,
        activity_type="RESULT_LOCKED",
        message=f"Results locked for {term.name}.",
        performed_by=context.user_id,
    ))
    session.commit()
    return PublicationResponse(
        term_id=term.id,
        status=OfficialResultStatus.LOCKED,
        students_processed=len(term_results),
        subjects_calculated=len(subject_results),
    )


@router.get("/students/{student_id}", response_model=List[TermResultDetailResponse])
def get_student_results(
    student_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    results = session.exec(select(TermResult).where(
        TermResult.student_id == student_id,
        TermResult.school_id == context.school_id,
        TermResult.status.in_([OfficialResultStatus.PUBLISHED, OfficialResultStatus.LOCKED]),
    ).order_by(TermResult.academic_session_name.desc(), TermResult.academic_term_name)).all()
    return [_published_term_detail(item, context.school_id, session) for item in results]


@router.get("/students/{student_id}/terms/{term_id}", response_model=TermResultDetailResponse)
def get_student_term_result(
    student_id: UUID,
    term_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    result = session.exec(select(TermResult).where(
        TermResult.student_id == student_id,
        TermResult.academic_term_id == term_id,
        TermResult.school_id == context.school_id,
        TermResult.status.in_([OfficialResultStatus.PUBLISHED, OfficialResultStatus.LOCKED]),
    )).first()
    if not result:
        raise HTTPException(status_code=404, detail="Published term result not found.")
    return _published_term_detail(result, context.school_id, session)


@router.get("/classes/{class_id}/terms/{term_id}", response_model=List[TermResultDetailResponse])
def get_class_term_results(
    class_id: UUID,
    term_id: UUID,
    context: CurrentContext = Depends(require_permission("result:read")),
    session: Session = Depends(get_session),
):
    results = session.exec(select(TermResult).where(
        TermResult.class_id == class_id,
        TermResult.academic_term_id == term_id,
        TermResult.school_id == context.school_id,
        TermResult.status.in_([OfficialResultStatus.PUBLISHED, OfficialResultStatus.LOCKED]),
    ).order_by(TermResult.student_name)).all()
    return [_published_term_detail(item, context.school_id, session) for item in results]
