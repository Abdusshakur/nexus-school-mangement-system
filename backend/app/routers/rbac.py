from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import and_, not_, or_
from typing import List
from uuid import UUID

from backend.app.db.database import get_session
from backend.app.core.auth_utils import CurrentContext, require_permission, require_super_admin
from backend.app.models import Role, Permission, RolePermissionLink, RoleScope
from backend.app.schemas.rbac import (
    RoleCreate, RoleUpdate, RoleResponse, RoleWithPermissionsResponse,
    PermissionCreate, PermissionResponse, AssignPermissionsRequest
)

router = APIRouter(
    prefix="/rbac",
    tags=["Role & Permission Management"]
)

PLATFORM_ONLY_PERMISSIONS = {"global_template:manage"}


def _visible_role_statement(context: CurrentContext):
    return select(Role).where(
        or_(
            Role.scope == RoleScope.PLATFORM,
            and_(Role.scope == RoleScope.SCHOOL, Role.school_id == context.school_id),
        )
    )


def _get_visible_role(role_id: UUID, context: CurrentContext, session: Session) -> Role:
    role = session.exec(
        _visible_role_statement(context).where(Role.id == role_id)
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found.")
    return role


def _validate_permission_ids(permission_ids: list[UUID], session: Session):
    permissions = session.exec(
        select(Permission).where(Permission.id.in_(permission_ids))
    ).all()
    found_ids = {permission.id for permission in permissions}
    missing_ids = set(permission_ids) - found_ids
    if missing_ids:
        raise HTTPException(status_code=400, detail=f"Permissions not found: {missing_ids}")
    return permissions


def _replace_role_permissions(role_id: UUID, permission_ids: list[UUID], session: Session):
    existing_links = session.exec(
        select(RolePermissionLink).where(RolePermissionLink.role_id == role_id)
    ).all()
    for link in existing_links:
        session.delete(link)
    for permission_id in permission_ids:
        session.add(RolePermissionLink(role_id=role_id, permission_id=permission_id))

# ==========================================
# PERMISSIONS MANAGEMENT
# ==========================================

@router.get("/permissions", response_model=List[PermissionResponse])
def list_permissions(
    context: CurrentContext = Depends(require_permission("admin:read")),
    session: Session = Depends(get_session)
):
    """List permissions assignable by the current administrator."""
    role = session.get(Role, context.role_id)
    is_super_admin = bool(role and role.name.lower() in {"super_admin", "superadmin"})
    statement = select(Permission).order_by(Permission.name)
    if not is_super_admin:
        statement = statement.where(not_(Permission.name.in_(PLATFORM_ONLY_PERMISSIONS)))
    return session.exec(statement).all()

@router.post("/permissions", include_in_schema=False)
def create_permission(
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    """Deprecated: application permissions are managed in code and migrations."""
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Permission creation is managed through the application registry and Alembic migrations.",
    )

# ==========================================
# ROLES MANAGEMENT
# ==========================================

@router.get("/roles", response_model=List[RoleResponse])
def list_roles(
    context: CurrentContext = Depends(require_permission("admin:read")),
    session: Session = Depends(get_session)
):
    """List platform roles and roles owned by the active school."""
    return session.exec(_visible_role_statement(context).order_by(Role.name)).all()

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    payload: RoleCreate,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session)
):
    """Create a new role (e.g., 'Head of Department')."""
    existing = session.exec(
        select(Role).where(
            Role.name == payload.name,
            Role.scope == RoleScope.PLATFORM,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Role '{payload.name}' already exists.")
    
    new_role = Role(
        name=payload.name,
        description=payload.description,
        scope=RoleScope.PLATFORM,
    )
    session.add(new_role)
    session.commit()
    session.refresh(new_role)
    
    return new_role

@router.get("/roles/{role_id}", response_model=RoleWithPermissionsResponse)
def get_role_details(
    role_id: UUID,
    context: CurrentContext = Depends(require_permission("admin:read")),
    session: Session = Depends(get_session)
):
    """Get a role and view all permissions attached to it."""
    return _get_visible_role(role_id, context, session)


@router.post("/school-roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_school_role(
    payload: RoleCreate,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    """Create a role owned by the active school."""
    existing = session.exec(
        select(Role).where(
            Role.school_id == context.school_id,
            Role.name == payload.name,
        )
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Role '{payload.name}' already exists in this school.")

    role = Role(
        name=payload.name,
        description=payload.description,
        scope=RoleScope.SCHOOL,
        school_id=context.school_id,
    )
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


@router.get("/school-roles", response_model=List[RoleResponse])
def list_school_roles(
    context: CurrentContext = Depends(require_permission("admin:read")),
    session: Session = Depends(get_session),
):
    """List roles owned by the active school."""
    return session.exec(
        select(Role)
        .where(Role.scope == RoleScope.SCHOOL, Role.school_id == context.school_id)
        .order_by(Role.name)
    ).all()


@router.patch("/school-roles/{role_id}", response_model=RoleResponse)
def update_school_role(
    role_id: UUID,
    payload: RoleUpdate,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    """Edit a role owned by the active school."""
    role = session.exec(
        select(Role).where(
            Role.id == role_id,
            Role.scope == RoleScope.SCHOOL,
            Role.school_id == context.school_id,
        )
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="School role not found.")
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="At least one role field is required.")
    if "name" in update_data:
        duplicate = session.exec(
            select(Role).where(
                Role.school_id == context.school_id,
                Role.name == update_data["name"],
                Role.id != role_id,
            )
        ).first()
        if duplicate:
            raise HTTPException(status_code=400, detail=f"Role '{update_data['name']}' already exists in this school.")
    for field, value in update_data.items():
        setattr(role, field, value)
    session.add(role)
    session.commit()
    session.refresh(role)
    return role

# ==========================================
# ROLE <-> PERMISSION MAPPING
# ==========================================

@router.post("/roles/{role_id}/permissions", response_model=RoleWithPermissionsResponse)
def assign_permissions_to_role(
    role_id: UUID,
    payload: AssignPermissionsRequest,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session)
):
    """Attach a batch of permissions to a specific role, replacing existing ones."""
    role = session.get(Role, role_id)
    if not role or role.scope != RoleScope.PLATFORM:
        raise HTTPException(status_code=404, detail="Platform role not found.")
    _validate_permission_ids(payload.permission_ids, session)
    _replace_role_permissions(role_id, payload.permission_ids, session)
    session.commit()
    session.refresh(role)
    return role


@router.put("/roles/{role_id}/permissions", response_model=RoleWithPermissionsResponse)
def update_platform_role_permissions(
    role_id: UUID,
    payload: AssignPermissionsRequest,
    context: CurrentContext = Depends(require_super_admin()),
    session: Session = Depends(get_session),
):
    """Replace the complete permission set for a platform role."""
    return assign_permissions_to_role(role_id, payload, context, session)


@router.post("/school-roles/{role_id}/permissions", response_model=RoleWithPermissionsResponse)
def assign_permissions_to_school_role(
    role_id: UUID,
    payload: AssignPermissionsRequest,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    """Replace permissions for a role owned by the active school."""
    role = session.exec(
        select(Role).where(
            Role.id == role_id,
            Role.scope == RoleScope.SCHOOL,
            Role.school_id == context.school_id,
        )
    ).first()
    if not role:
        raise HTTPException(status_code=404, detail="School role not found.")

    permissions = _validate_permission_ids(payload.permission_ids, session)
    restricted = PLATFORM_ONLY_PERMISSIONS.intersection(
        permission.name for permission in permissions
    )
    if restricted:
        raise HTTPException(
            status_code=400,
            detail=f"Platform-only permissions cannot be assigned to school roles: {sorted(restricted)}",
        )
    _replace_role_permissions(role_id, payload.permission_ids, session)
    session.commit()
    session.refresh(role)
    return role


@router.put("/school-roles/{role_id}/permissions", response_model=RoleWithPermissionsResponse)
def update_school_role_permissions(
    role_id: UUID,
    payload: AssignPermissionsRequest,
    context: CurrentContext = Depends(require_permission("admin:write")),
    session: Session = Depends(get_session),
):
    """Replace the complete permission set for a school-owned role."""
    return assign_permissions_to_school_role(role_id, payload, context, session)
