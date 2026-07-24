import { generateAttendance } from "../data";

// Attendance Tab component for displaying student attendance in a calendar heatmap format, along with summary statistics.

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const STATUS_CFG = {
  P: {
    label: "Present",
    bg: "bg-indigo-100",
    color: "text-indigo-500",
    border: "border-indigo-200",
  },
  L: {
    label: "Late",
    bg: "bg-amber-100",
    color: "text-amber-500",
    border: "border-amber-200",
  },
  A: {
    label: "Absent",
    bg: "bg-red-100",
    color: "text-red-500",
    border: "border-red-200",
  },
  H: {
    label: "Holiday",
    bg: "bg-slate-100",
    color: "text-slate-400",
    border: "border-slate-200",
  },
};

export function AttendanceTab({
  studentId,
  session,
}: {
  studentId: string;
  session: string;
}) {
  const att = generateAttendance(studentId, session);
  const weeks = Array.from({ length: 12 }, (_, w) =>
    att.days.filter((d) => d.week === w),
  );

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Total School Days",
            value: att.total,
            color: "text-indigo-500",
          },
          { label: "Present", value: att.present, color: "text-indigo-500" },
          { label: "Late", value: att.late, color: "text-amber-500" },
          { label: "Absent", value: att.absent, color: "text-red-500" },
          {
            label: "Attendance Rate",
            value: `${att.rate}%`,
            color:
              att.rate >= 90
                ? "text-indigo-500"
                : att.rate >= 80
                  ? "text-indigo-500"
                  : "text-red-500",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 border border-slate-200"
          >
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className={`font-bold mt-0.5 text-2xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Rate bar */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">
            Term Attendance Rate
          </p>
          <p
            className={`font-bold ${att.rate >= 90 ? "text-indigo-500" : "text-amber-500"}`}
          >
            {att.rate}%
          </p>
        </div>
        <div className="h-3 rounded-full overflow-hidden bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${att.rate >= 90 ? "bg-indigo-500" : att.rate >= 80 ? "bg-indigo-500" : "bg-amber-500"}`}
            style={{ width: `${att.rate}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3">
          {Object.entries(STATUS_CFG)
            .filter(([k]) => k !== "H")
            .map(([k, v]) => (
              <span
                key={k}
                className="flex items-center gap-1.5 text-xs text-slate-500"
              >
                <span
                  className={`w-2.5 h-2.5 rounded-sm border ${v.bg} ${v.border}`}
                />
                {v.label}
              </span>
            ))}
        </div>
      </div>

      {/* Calendar heatmap */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <h3 className="font-semibold mb-4 text-slate-900">
          Term Calendar for {session}
        </h3>
        {/* Day headers */}
        <div
          className="grid gap-1 mb-1"
          style={{ gridTemplateColumns: "40px repeat(5, 1fr)" }}
        >
          <div />
          {DOW_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-xs font-semibold text-slate-400"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Week rows */}
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid gap-1 mb-1"
            style={{ gridTemplateColumns: "40px repeat(5, 1fr)" }}
          >
            <div className="flex items-center justify-end pr-2 text-xs text-slate-400">
              W{wi + 1}
            </div>
            {[0, 1, 2, 3, 4].map((dow) => {
              const day = week.find((d) => d.dow === dow);
              if (!day) return <div key={dow} />;
              const cfg = STATUS_CFG[day.status];
              return (
                <div
                  key={dow}
                  className={`h-8 rounded-md flex items-center justify-center text-xs font-bold cursor-default border ${cfg.bg} ${cfg.color} ${cfg.border}`}
                  title={cfg.label}
                >
                  {day.status}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Weekly Breakdown</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["Week", "Present", "Late", "Absent", "Rate"].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {weeks.map((week, wi) => {
              const p = week.filter((d) => d.status === "P").length;
              const l = week.filter((d) => d.status === "L").length;
              const a = week.filter((d) => d.status === "A").length;
              const total = week.filter((d) => d.status !== "H").length;
              const rate = total ? Math.round(((p + l) / total) * 100) : 100;
              return (
                <tr key={wi} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">
                    Week {wi + 1}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-indigo-500">
                    {p}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-amber-500">
                    {l}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-red-500">
                    {a}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rate >= 90
                          ? "bg-indigo-100 text-indigo-800"
                          : rate >= 80
                            ? "bg-indigo-50 text-indigo-700"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
