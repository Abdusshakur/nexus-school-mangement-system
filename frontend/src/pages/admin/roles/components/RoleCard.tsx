import { Edit2, ShieldCheck, Check, Loader2 } from "lucide-react";
import type { RoleWithPermissionsResponse } from "../../../../types/rbac";

interface RoleCardProps {
  role: RoleWithPermissionsResponse;
  onEdit: () => void;
  isLoading?: boolean;
}

export function RoleCard({ role, onEdit, isLoading }: RoleCardProps) {
  return (
    <div className="rounded-xl flex flex-col bg-white border border-slate-200">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-indigo-50">
              <ShieldCheck size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{role.name}</h3>
              <p className="text-xs mt-0.5 text-slate-400">Custom Role</p>
            </div>
          </div>
        </div>
        <p className="text-xs mt-3 text-slate-500">
          {role.description || "No description provided."}
        </p>
      </div>

      {/* Permissions List */}
      <div className="px-5 py-4 flex-1 flex flex-col justify-start">
        <p className="text-xs mb-3 text-slate-500">Permissions</p>
        <ul className="space-y-2.5">
          {role.permissions ? (
            <>
              {role.permissions.slice(0, 3).map((perm, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="mt-1 text-emerald-500">
                    <Check size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm leading-snug truncate text-slate-600">
                    {perm.name}
                  </span>
                </li>
              ))}
              {role.permissions.length > 3 && (
                <li className="flex items-center gap-2 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1"></div>
                  <span className="text-xs font-medium text-slate-400">
                    +{role.permissions.length - 3} more permissions
                  </span>
                </li>
              )}
              {role.permissions.length === 0 && (
                <li className="text-sm italic text-slate-400">
                  No permissions assigned.
                </li>
              )}
            </>
          ) : (
            <li className="text-xs italic text-slate-400">
              Permissions data unavailable.
            </li>
          )}
        </ul>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 flex items-center justify-end border-t border-slate-100">
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80 bg-indigo-50 text-indigo-700 border border-indigo-200 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Edit2 size={12} />
            )}
            {isLoading ? "Loading..." : "Edit Permissions"}
          </button>
        </div>
      </div>
    </div>
  );
}
