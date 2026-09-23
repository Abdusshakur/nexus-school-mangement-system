export interface PermissionResponse {
  id: string;
  name: string;
  description: string | null;
}

export type RoleScope = "PLATFORM" | "SCHOOL";

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  school_id: string | null;
}

export interface RoleWithPermissionsResponse extends RoleResponse {
  permissions: PermissionResponse[];
}
