import {
  ChevronDown,
  ChevronUp,
  CalendarCheck,
  ClipboardList,
  TrendingUp,
  Hash,
  BookOpen,
} from "lucide-react";
import {
  recentAttendance,
  ATTENDANCE_STYLE,
  PRIORITY_STYLES,
  formatDate,
} from "../utils";

export function ChildCard({
  child,
  expanded,
  onToggle,
  assignments,
}: {
  child: { name: string; classId: string; className: string; admNo: string };
  expanded: boolean;
  onToggle: () => void;
  assignments: any[];
}) {
  const childAssignments = assignments
    .filter((a) => a.classId === child.classId && a.status === "published")
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.dueDate).getTime() -
        new Date(a.createdAt || a.dueDate).getTime()
    )
    .slice(0, 3);

  const attendanceDays = recentAttendance(child.name);

  const initials = child.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

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
            {initials}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg text-slate-900">
            {child.name}
          </p>
          <p className="text-sm mt-0.5 text-slate-500">
            {child.className}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <Hash size={11} className="text-slate-400" />
            <span className="text-xs text-slate-400">
              {child.admNo}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="hidden sm:flex items-center gap-5 flex-shrink-0">
          {[
            {
              label: "Attendance",
              value: "94%",
              icon: CalendarCheck,
              color: "text-indigo-500",
            },
            {
              label: "Avg Grade",
              value: "78%",
              icon: TrendingUp,
              color: "text-teal-600",
            },
            {
              label: "Assignments",
              value: childAssignments.length,
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
              <span className="text-xs text-slate-400">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Expand toggle */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${expanded ? "bg-indigo-50" : "bg-slate-50"}`}
        >
          {expanded ? (
            <ChevronUp size={16} className="text-indigo-500" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Mobile stats */}
      <div className="sm:hidden grid grid-cols-3 gap-0 px-5 pb-4">
        {[
          { label: "Attendance", value: "94%" },
          { label: "Avg Grade", value: "78%" },
          {
            label: "Assignments",
            value: childAssignments.length,
          },
        ].map(({ label, value }) => (
          <div key={label} className="text-center">
            <p className="font-bold text-sm text-slate-900">
              {value}
            </p>
            <p className="text-xs text-slate-400">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 space-y-5 border-t border-slate-100">
          {/* Recent attendance */}
          <div className="pt-5">
            <h4 className="font-semibold text-sm mb-3 text-slate-900">
              Recent Attendance
            </h4>
            <div className="flex flex-wrap gap-2">
              {attendanceDays.map((d, i) => {
                const s = ATTENDANCE_STYLE[d.status];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${s.bg} ${s.text}`}
                  >
                    <span>{d.date}</span>
                    <span className="opacity-70">·</span>
                    <span>{d.status}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent assignments */}
          <div>
            <h4 className="font-semibold text-sm mb-3 text-slate-900">
              Recent Assignments
            </h4>
            {childAssignments.length === 0 ? (
              <p className="text-sm text-slate-400">
                No published assignments for {child.className} yet.
              </p>
            ) : (
              <div className="space-y-2">
                {childAssignments.map((a) => {
                  const ps = PRIORITY_STYLES[a.priority];
                  const isOverdue = new Date(a.dueDate) < new Date();
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-indigo-50">
                        <BookOpen size={14} className="text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          {a.title}
                        </p>
                        <p className="text-xs mt-0.5 text-slate-500">
                          {a.subject} · {a.teacherName || "Teacher"}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-semibold ${ps.bg} ${ps.text}`}
                          >
                            {a.priority}
                          </span>
                          <span
                            className={`text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}
                          >
                            Due {formatDate(a.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
