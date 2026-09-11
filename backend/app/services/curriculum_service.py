"""Shared validation and lookup rules for class-group curricula."""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlmodel import Session, select

from backend.app.models import (
    AcademicSession,
    AcademicTerm,
    ClassGroup,
    GroupSubject,
    SchoolClass,
    Subject,
)


def get_class_group(
    class_id: UUID,
    school_id: UUID,
    session: Session,
    *,
    require_group: bool = False,
) -> tuple[SchoolClass, Optional[ClassGroup]]:
    school_class = session.exec(
        select(SchoolClass).where(
            SchoolClass.id == class_id,
            SchoolClass.school_id == school_id,
        )
    ).first()
    if not school_class:
        raise HTTPException(status_code=404, detail="Class not found.")

    group = None
    if school_class.group_id:
        group = session.exec(
            select(ClassGroup).where(
                ClassGroup.id == school_class.group_id,
                ClassGroup.school_id == school_id,
            )
        ).first()
        if not group:
            raise HTTPException(status_code=409, detail="Class is linked to an invalid curriculum group.")
    if require_group and (not group or not group.is_active):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Assign an active curriculum group to this class first.",
        )
    return school_class, group


def validate_academic_context(
    school_id: UUID,
    academic_session_id: UUID,
    academic_term_id: UUID,
    session: Session,
) -> tuple[AcademicSession, AcademicTerm]:
    academic_session = session.exec(
        select(AcademicSession).where(
            AcademicSession.id == academic_session_id,
            AcademicSession.school_id == school_id,
        )
    ).first()
    academic_term = session.exec(
        select(AcademicTerm).where(
            AcademicTerm.id == academic_term_id,
            AcademicTerm.school_id == school_id,
            AcademicTerm.session_id == academic_session_id,
        )
    ).first()
    if not academic_session or not academic_term:
        raise HTTPException(status_code=400, detail="Invalid academic session or term for this school.")
    return academic_session, academic_term


def get_subjects_for_class(
    class_id: UUID,
    school_id: UUID,
    academic_session_id: UUID,
    academic_term_id: UUID,
    session: Session,
) -> tuple[SchoolClass, Optional[ClassGroup], list[tuple[GroupSubject, Subject]]]:
    school_class, group = get_class_group(class_id, school_id, session)
    if not group or not group.is_active:
        return school_class, group, []
    rows = session.exec(
        select(GroupSubject, Subject)
        .join(Subject, GroupSubject.subject_id == Subject.id)
        .where(
            GroupSubject.school_id == school_id,
            GroupSubject.group_id == group.id,
            GroupSubject.academic_session_id == academic_session_id,
            GroupSubject.academic_term_id == academic_term_id,
            GroupSubject.is_active.is_(True),
            Subject.school_id == school_id,
        )
        .order_by(Subject.name)
    ).all()
    return school_class, group, rows


def validate_class_subject_access(
    class_id: UUID,
    subject_id: UUID,
    academic_session_id: UUID,
    academic_term_id: UUID,
    school_id: UUID,
    session: Session,
) -> GroupSubject:
    school_class, group = get_class_group(class_id, school_id, session, require_group=True)
    subject = session.exec(
        select(Subject).where(
            Subject.id == subject_id,
            Subject.school_id == school_id,
        )
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found.")
    validate_academic_context(school_id, academic_session_id, academic_term_id, session)
    group_subject = session.exec(
        select(GroupSubject).where(
            GroupSubject.school_id == school_id,
            GroupSubject.group_id == group.id,
            GroupSubject.subject_id == subject_id,
            GroupSubject.academic_session_id == academic_session_id,
            GroupSubject.academic_term_id == academic_term_id,
            GroupSubject.is_active.is_(True),
        )
    ).first()
    if not group_subject:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Subject '{subject.name}' is not assigned to class '{school_class.name}' for this academic term.",
        )
    return group_subject
