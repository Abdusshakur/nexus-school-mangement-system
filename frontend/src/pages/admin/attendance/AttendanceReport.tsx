import { ROUTES } from "../../../config/routes";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { studentsList } from "./data";

export function AttendanceReport() {
  const [gradeFilter, setGradeFilter] = useState("All");
  const [monthFilter, setMonthFilter] = useState("June 2026");

  // Predictable pseudorandom reporting data
  const reportData = studentsList.map((s, idx) => {
    const present = [19, 18, 20, 17, 20, 16, 18, 19][idx % 8];
    const absent = [0, 1, 0, 2, 0, 3, 1, 0][idx % 8];
    const late = [1, 1, 0, 1, 0, 1, 1, 1][idx % 8];
    const rate = Math.round((present / 20) * 100);
    return {
      ...s,
      totalDays: 20,
      present,
      absent,
      late,
      rate,
    };
  });

  const filteredReport =
    gradeFilter === "All"
      ? reportData
      : reportData.filter((r) => r.grade === gradeFilter);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.ATTENDANCE}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Attendance Report
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monthly attendance aggregate summary
          </p>
        </div>
        <button className="ml-auto flex items-center gap-2 px-4.5 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer">
          <Download size={15} /> Export CSV
        </button>
      </header>

      <main className="flex-1 p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4 shadow-sm">
          <div className="w-full sm:w-48">
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Grade Level
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {[
                "All",
                "JSS 1",
                "JSS 2",
                "JSS 3",
                "SS 1",
                "SS 2",
                "SS 3",
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Reporting Period
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {["June 2026", "May 2026", "April 2026", "March 2026"].map(
                (m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                    Present
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                    Late
                  </th>
                  <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider text-center">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReport.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: s.avatarColor }}
                        >
                          <span className="text-white font-bold text-[10px]">
                            {s.avatar}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800">
                          {s.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-semibold">
                      {s.grade}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-indigo-600 text-sm">
                      {s.present}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-red-500 text-sm">
                      {s.absent}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-amber-500 text-sm">
                      {s.late}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          background:
                            s.rate >= 90
                              ? "#D1FAE5"
                              : s.rate >= 80
                                ? "#EEF2FF"
                                : "#FEE2E2",
                          color:
                            s.rate >= 90
                              ? "#065F46"
                              : s.rate >= 80
                                ? "#4338CA"
                                : "#991B1B",
                        }}
                      >
                        {s.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
