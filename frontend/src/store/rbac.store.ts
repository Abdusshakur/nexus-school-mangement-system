import { create } from "zustand";
import {
  fetchPermissionsApi,
  fetchSchoolRolesApi,
  createSchoolRoleApi,
  updateSchoolRoleApi,
  assignRolePermissionsApi,
  getRoleDetailsApi,
} from "../api/rbac";
import type { PermissionResponse, RoleWithPermissionsResponse } from "../types/rbac";

interface RbacState {
  permissions: PermissionResponse[];
  schoolRoles: RoleWithPermissionsResponse[];
  loadingPermissions: boolean;
  loadingRoles: boolean;
  error: string | null;

  fetchPermissions: () => Promise<void>;
  fetchSchoolRoles: () => Promise<void>;
  createSchoolRole: (name: string, description: string) => Promise<RoleWithPermissionsResponse>;
  updateSchoolRole: (id: string, name: string, description: string) => Promise<RoleWithPermissionsResponse>;
  assignRolePermissions: (id: string, permissionIds: string[]) => Promise<RoleWithPermissionsResponse>;
  getRoleDetails: (id: string) => Promise<RoleWithPermissionsResponse>;
}

export const useRbacStore = create<RbacState>((set) => ({
  permissions: [],
  schoolRoles: [],
  loadingPermissions: false,
  loadingRoles: false,
  error: null,

  fetchPermissions: async () => {
    set({ loadingPermissions: true, error: null });
    try {
      const payload = await fetchPermissionsApi();
      set({ permissions: payload });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to load permissions" });
    } finally {
      set({ loadingPermissions: false });
    }
  },

  fetchSchoolRoles: async () => {
    set({ loadingRoles: true, error: null });
    try {
      const payload = await fetchSchoolRolesApi();
      set({ schoolRoles: payload });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || "Failed to load school roles" });
    } finally {
      set({ loadingRoles: false });
    }
  },

  createSchoolRole: async (name: string, description: string) => {
    const payload = await createSchoolRoleApi(name, description);
    set((state) => ({ schoolRoles: [...state.schoolRoles, payload] }));
    return payload;
  },

  updateSchoolRole: async (id: string, name: string, description: string) => {
    const payload = await updateSchoolRoleApi(id, name, description);
    set((state) => ({
      schoolRoles: state.schoolRoles.map((r) => (r.id === id ? payload : r)),
    }));
    return payload;
  },

  assignRolePermissions: async (id: string, permissionIds: string[]) => {
    const payload = await assignRolePermissionsApi(id, permissionIds);
    return payload;
  },

  getRoleDetails: async (id: string) => {
    const payload = await getRoleDetailsApi(id);
    return payload;
  },
}));
