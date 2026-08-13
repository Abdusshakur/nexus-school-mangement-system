import { CheckCircle, Calendar, Users, BookOpen } from "lucide-react";
import type { AcademicSession } from "../../../../store/session.store";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface OverviewTabProps {
  session: AcademicSession;
  classesCount: number;
}

export function OverviewTab({ session, classesCount }: OverviewTabProps) {
  const isActive = session.status === "active";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Status",
            value: isActive
              ? "Active"
              : session.status === "locked"
                ? "Locked"
                : "Archived",
            icon: CheckCircle,
            bg: "bg-indigo-50",
            color: "text-indigo-600",
          },
          {
            label: "Current Term",
            value: session.term,
            icon: Calendar,
            bg: "bg-amber-100",
            color: "text-amber-500",
          },
          {
            label: "Total Students",
            value: "250",
            icon: Users,
            bg: "bg-emerald-100",
            color: "text-emerald-500",
          },
          {
            label: "Total Classes",
            value: classesCount.toString(),
            icon: BookOpen,
            bg: "bg-purple-50",
            color: "text-purple-500",
          },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}
              >
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="font-bold text-[20px] text-slate-900">
                  {value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold mb-4 text-slate-900">
            Session Information
          </h3>
          {[
            { label: "Academic Year", value: session.name },
            { label: "Start Date", value: fmtDate(session.startDate) },
            { label: "End Date", value: fmtDate(session.endDate) },
            { label: "Created", value: fmtDate(session.startDate) }, // No createdAt field in store, reuse startDate
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
            >
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="font-semibold mb-4 text-slate-900">
            Performance Summary
          </h3>
          {[
            { label: "Avg Attendance", value: "91%" },
            { label: "Avg Grade", value: "B2" },
            { label: "Reports Published", value: "3 / 3" },
            { label: "Promotion Rate", value: "87%" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0"
            >
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-bold text-indigo-500">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
