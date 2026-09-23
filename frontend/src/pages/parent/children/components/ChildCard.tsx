import {
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Hash,
  BookOpen,
} from "lucide-react";
import { type LinkedStudentResponse } from "../../../../api/parentContext";

export function ChildCard({
  child,
  expanded,
  onToggle,
}: {
  child: LinkedStudentResponse;
  expanded: boolean;
  onToggle: () => void;
}) {
  const childName = `${child.first_name} ${child.last_name}`;

  const initials = child.first_name
    ? child.first_name[0] + (child.last_name ? child.last_name[0] : "")
    : "ST";

  return (
    <div className="bg-white rounded-xl overflow-hidden transition-all border border-slate-200">
      {/* Card header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors hover:bg-slate-50 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-500">
          <span className="text-white font-bold text-lg">
            {initials.toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-slate-900">{childName}</p>
          <p className="text-sm mt-0.5 text-slate-500">
            {child.class_name || "No Class Assigned"}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Hash size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {child.admission_number || "No Adm No."}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
          {[
            {
              label: "Attendance",
              value: "--",
              icon: CalendarCheck,
              color: "text-indigo-500",
            },
            {
              label: "Avg Grade",
              value: "--",
              icon: TrendingUp,
              color: "text-teal-600",
            },
            {
              label: "Assignments",
              value: "N/A",
              icon: ClipboardList,
              color: "text-purple-500",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <Icon size={13} className={color} />
                <span className="font-bold text-sm text-slate-900">
                  {value}
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="text-slate-400 flex-shrink-0 ml-4">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignments section */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                    <ClipboardList size={16} />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Recent Assignments
                  </h3>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <ClipboardList size={24} className="text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">
                  Coming Soon
                </p>
              </div>
            </div>

            {/* General Info / Subjects */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <BookOpen size={16} />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  Student Details
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">Relationship</span>
                  <span className="text-sm font-medium text-slate-900 capitalize">
                    {child.relationship_type?.toLowerCase() ||
                      "Parent/Guardian"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">Status</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
