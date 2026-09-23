import apiClient from "./client";
import type { PermissionResponse, RoleWithPermissionsResponse } from "../types/rbac";

export async function fetchPermissionsApi(): Promise<PermissionResponse[]> {
  const payload = await apiClient.get<PermissionResponse[]>("/rbac/permissions");
  return payload as unknown as PermissionResponse[];
}

export async function fetchSchoolRolesApi(): Promise<RoleWithPermissionsResponse[]> {
  const payload = await apiClient.get<RoleWithPermissionsResponse[]>("/rbac/school-roles");
  return payload as unknown as RoleWithPermissionsResponse[];
}

export async function createSchoolRoleApi(name: string, description: string): Promise<RoleWithPermissionsResponse> {
  const payload = await apiClient.post<RoleWithPermissionsResponse>("/rbac/school-roles", { name, description });
  return payload as unknown as RoleWithPermissionsResponse;
}

export async function updateSchoolRoleApi(id: string, name: string, description: string): Promise<RoleWithPermissionsResponse> {
  const payload = await apiClient.patch<RoleWithPermissionsResponse>(`/rbac/school-roles/${id}`, { name, description });
  return payload as unknown as RoleWithPermissionsResponse;
}

export async function assignRolePermissionsApi(id: string, permissionIds: string[]): Promise<RoleWithPermissionsResponse> {
  const payload = await apiClient.post<RoleWithPermissionsResponse>(
    `/rbac/school-roles/${id}/permissions`,
    { permission_ids: permissionIds }
  );
  return payload as unknown as RoleWithPermissionsResponse;
}

export async function getRoleDetailsApi(id: string): Promise<RoleWithPermissionsResponse> {
  const payload = await apiClient.get<RoleWithPermissionsResponse>(`/rbac/roles/${id}`);
  return payload as unknown as RoleWithPermissionsResponse;
}
