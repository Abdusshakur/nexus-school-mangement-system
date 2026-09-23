import { useState, useMemo } from "react";
import { X, Check, Loader2 } from "lucide-react";
import type {
  PermissionResponse,
  RoleWithPermissionsResponse,
} from "../../../../types/rbac";

interface RoleModalProps {
  initial?: RoleWithPermissionsResponse;
  allPermissions: PermissionResponse[];
  onClose: () => void;
  onSave: (name: string, description: string, permissionIds: string[]) => void;
  saving?: boolean;
}

export function RoleModal({
  initial,
  allPermissions,
  onClose,
  onSave,
  saving,
}: RoleModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initial?.permissions?.map((p) => p.id) ?? []),
  );

  // Group permissions dynamically by their prefix before the colon
  const categories = useMemo(() => {
    const groups: Record<string, PermissionResponse[]> = {};
    for (const perm of allPermissions) {
      const prefix = perm.name.split(":")[0];
      const categoryName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(perm);
    }
    return groups;
  }, [allPermissions]);

  const toggle = (permId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const toggleCategory = (perms: PermissionResponse[]) => {
    const allSelected = perms.every((p) => selectedIds.has(p.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        perms.forEach((p) => next.delete(p.id));
      } else {
        perms.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const canSave =
    name.trim().length > 0 && description.trim().length > 0 && !saving;

  const handleSave = () => {
    if (!canSave) return;
    onSave(name.trim(), description.trim(), Array.from(selectedIds));
  };

  const isEditing = Boolean(initial);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="flex flex-col rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 w-[700px] max-h-[90vh] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? `Edit Role: ${initial!.name}` : "Create Custom Role"}
          </h3>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-50 text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-900">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Disciplinary Head"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 disabled:opacity-70 border border-slate-200 text-slate-900 bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-900">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe the role's responsibilities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                className="w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none resize-none disabled:opacity-70 border border-slate-200 text-slate-900 bg-slate-50"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-3 text-slate-900">
              Permissions
            </p>
            <div className="flex flex-col gap-5">
              {Object.entries(categories).map(([cat, perms]) => {
                const allSelected = perms.every((p) => selectedIds.has(p.id));
                const someSelected = perms.some((p) => selectedIds.has(p.id));
                return (
                  <div
                    key={cat}
                    className="bg-slate-50 p-4 rounded-xl border border-slate-100"
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {cat}
                      </p>
                      <button
                        onClick={() => toggleCategory(perms)}
                        disabled={saving}
                        className="text-xs font-semibold hover:underline disabled:opacity-50"
                        style={{ color: allSelected ? "#EF4444" : "#6366F1" }}
                      >
                        {allSelected
                          ? "Deselect all"
                          : someSelected
                            ? "Select all"
                            : "Select all"}
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-white transition-colors border border-transparent hover:border-slate-200"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!saving) toggle(perm.id);
                          }}
                        >
                          <div
                            className="w-4 h-4 mt-0.5 rounded flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              background: selectedIds.has(perm.id)
                                ? "#6366F1"
                                : "#FFFFFF",
                              border: selectedIds.has(perm.id)
                                ? "none"
                                : "1px solid #CBD5E1",
                            }}
                          >
                            {selectedIds.has(perm.id) && (
                              <Check size={10} color="#FFFFFF" />
                            )}
                          </div>
                          <div className="flex-1">
                            <code className="text-xs font-mono font-semibold text-slate-700">
                              {perm.name}
                            </code>
                            <p className="text-[11px] mt-1 leading-snug text-slate-500">
                              {perm.description || "No description available."}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 flex gap-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 bg-indigo-500 text-white ${!canSave && "opacity-50"}`}
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Role"}
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border hover:bg-slate-200 transition-colors disabled:opacity-50"
            style={{
              background: "#F1F5F9",
              color: "#475569",
              borderColor: "#E2E8F0",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
