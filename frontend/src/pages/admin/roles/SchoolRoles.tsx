import { useState, useEffect } from "react";
import { Plus, Info, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useRbacStore } from "../../../store/rbac.store";
import { RoleCard } from "./components/RoleCard";
import { RoleModal } from "./components/RoleModal";
import { Skeleton } from "../../../components/ui/Skeleton";
import type { RoleWithPermissionsResponse } from "../../../types/rbac";

export function SchoolRoles() {
  const {
    schoolRoles,
    permissions,
    loadingRoles,
    loadingPermissions,
    fetchPermissions,
    fetchSchoolRoles,
    createSchoolRole,
    assignRolePermissions,
    getRoleDetails
  } = useRbacStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleWithPermissionsResponse | null>(null);
  const [loadingRoleId, setLoadingRoleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchoolRoles();
    fetchPermissions();
  }, [fetchSchoolRoles, fetchPermissions]);

  const handleCreate = async (name: string, description: string, permissionIds: string[]) => {
    setSaving(true);
    try {
      // Create Role
      const newRole = await createSchoolRole(name, description);
      // ssign Permissions
      await assignRolePermissions(newRole.id, permissionIds);
      toast.success("Role created successfully!");
      setShowCreateModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (_name: string, _description: string, permissionIds: string[]) => {
    if (!editingRole) return;
    setSaving(true);
    try {

      // cant update name/description yet .
      await assignRolePermissions(editingRole.id, permissionIds);
      toast.success("Role permissions updated!");
      setEditingRole(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = async (roleId: string) => {
    try {
      setLoadingRoleId(roleId);
      const details = await getRoleDetails(roleId);
      setEditingRole(details);
    } catch (err) {
      toast.error("Failed to load role details");
    } finally {
      setLoadingRoleId(null);
    }
  };

  if (loadingRoles || loadingPermissions) {
    return (
      <div className="min-h-screen p-6 bg-slate-50">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        {/* Info Banner Skeleton */}
        <Skeleton className="h-16 w-full rounded-xl mb-6" />

        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            School Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Custom roles and access control
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/20"
        >
          <Plus size={16} />
          Create Role
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6 shadow-sm bg-indigo-50 border border-indigo-200">
        <Info size={16} className="mt-0.5 shrink-0 text-indigo-700" />
        <p className="text-sm leading-relaxed text-indigo-800">
          Create custom roles specific to your school (e.g. Head of Department). These roles are separate from the platform default roles (Admin, Teacher, Parent)
          and strictly apply to your school's boundaries.
        </p>
      </div>

      {/* Role Cards Grid */}
      {schoolRoles.length === 0 ? (
        <div className="rounded-2xl flex flex-col items-center justify-center py-24 text-center mt-6 bg-white border border-dashed border-slate-300">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-indigo-50">
            <ShieldCheck size={28} className="text-indigo-500" />
          </div>
          <p className="text-lg font-bold mb-1.5 text-slate-900">No Custom Roles Yet</p>
          <p className="text-sm mb-6 max-w-sm text-slate-500">
            Create custom roles tailored to your school's specific administrative structure.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold shadow-md transition-all bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-500/30"
          >
            <Plus size={16} />
            Create First Role
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {schoolRoles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => openEditModal(role.id)}
              isLoading={loadingRoleId === role.id}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <RoleModal
          allPermissions={permissions}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreate}
          saving={saving}
        />
      )}

      {/* Edit Modal */}
      {editingRole && (
        <RoleModal
          initial={editingRole}
          allPermissions={permissions}
          onClose={() => setEditingRole(null)}
          onSave={handleEdit}
          saving={saving}
        />
      )}
    </div>
  );
}
