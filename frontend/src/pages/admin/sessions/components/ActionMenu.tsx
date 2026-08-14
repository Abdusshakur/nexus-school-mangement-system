import { useState } from "react";
import { Eye, Edit2, Lock, Copy, MoreVertical } from "lucide-react";

export function ActionMenu({
  onViewDetails,
}: {
  onViewDetails: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-20 bg-white rounded-xl shadow-lg py-1 min-w-[170px] border border-slate-200 top-full mt-1">
            {[
              { label: "View Details", icon: Eye, action: onViewDetails },
              { label: "Edit", icon: Edit2, action: () => setOpen(false) },
              { label: "Lock", icon: Lock, action: () => setOpen(false) },
              { label: "Duplicate Config", icon: Copy, action: () => setOpen(false) },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={() => {
                  action();
                  setOpen(false);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Icon size={14} className="text-slate-400" /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
