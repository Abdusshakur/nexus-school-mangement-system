from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID

from backend.app.models import RoleScope

class PermissionBase(BaseModel):
    name: str  # e.g., "attendance:write", "teacher:read"
    description: Optional[str] = None

class PermissionCreate(PermissionBase):
    pass

class PermissionResponse(PermissionBase):
    id: UUID

class RoleBase(BaseModel):
    name: str  # e.g., "admin", "class_teacher", "principal"
    description: Optional[str] = None

class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RoleResponse(RoleBase):
    id: UUID
    scope: RoleScope
    school_id: Optional[UUID] = None

class RoleWithPermissionsResponse(RoleResponse):
    permissions: List[PermissionResponse]

class AssignPermissionsRequest(BaseModel):
    permission_ids: List[UUID]
