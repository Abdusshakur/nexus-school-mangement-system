import { ROUTES } from "../../../config/routes";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  generateMockMonthlyAttendance,
  type StudentMonthlyRecord,
} from "./data";

const CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];
const MONTHS = ["September 2026", "August 2026", "July 2026", "June 2026"];

export function AttendanceReport() {
  const [monthFilter, setMonthFilter] = useState("September 2026");
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<StudentMonthlyRecord[]>([]);

  const handleClassSelect = (cls: string) => {
    setLoading(true);
    setSelectedClass(cls);
  };

  const handleMonthChange = (val: string) => {
    setLoading(true);
    setMonthFilter(val);
  };

  // Simulate network load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (selectedClass) {
        setReportData(generateMockMonthlyAttendance(selectedClass, 22));
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedClass, monthFilter]);

  if (!selectedClass) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FE]">
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to={ROUTES.ADMIN.ATTENDANCE}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-slate-900 text-xl font-bold">
                Performance Report
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Monthly attendance aggregate summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">
                Period:
              </span>
              <select
                value={monthFilter}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white focus:outline-none focus:border-indigo-500"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CLASSES.map((cls) => (
              <div
                key={cls}
                onClick={() => handleClassSelect(cls)}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-sm cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Average Rate</p>
                    <span className="text-lg font-bold text-slate-900">
                      92%
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-1">{cls}</h3>
                <p className="text-sm text-slate-500">
                  Class Teacher: Unassigned
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Calculate stats
  const topAttendees = reportData.filter((r) => r.rate >= 95).length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F4F7FE]">
      <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedClass(null)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-slate-900 text-xl font-bold">
              {selectedClass} Report
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {monthFilter} Attendance Summary
            </p>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </header>

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">
                Total Students
              </span>
              <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {reportData.length}
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">
                Top Attendees (&ge; 95%)
              </span>
              <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">
              {topAttendees}
            </span>
          </div>

          {/* <div className="bg-white rounded-lg border border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">
                At Risk (&lt; 85%)
              </span>
              <div className="w-8 h-8 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            </div>
            <span className="text-2xl font-bold text-slate-900">{atRisk}</span>
          </div> */}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Student Attendance Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200">
                  <th className="px-6 py-4 text-slate-500 text-xs font-semibold w-64">
                    Student
                  </th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-semibold">
                    Monthly Heatmap (22 Days)
                  </th>
                  <th className="px-4 py-4 text-slate-500 text-xs font-semibold text-center">
                    Present
                  </th>
                  <th className="px-4 py-4 text-slate-500 text-xs font-semibold text-center">
                    Absent
                  </th>
                  <th className="px-4 py-4 text-slate-500 text-xs font-semibold text-center">
                    Late
                  </th>
                  <th className="px-6 py-4 text-slate-500 text-xs font-semibold text-right">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-4 w-6 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-4 w-6 mx-auto" />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Skeleton className="h-4 w-6 mx-auto" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Skeleton className="h-4 w-8 ml-auto" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      No students found in this class.
                    </td>
                  </tr>
                ) : (
                  reportData.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${s.avatarColor}`}
                          >
                            <span className="text-white font-medium text-xs">
                              {s.avatar}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {s.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1.5 flex-wrap max-w-[280px]">
                          {s.heatmap.map((status, index) => (
                            <div
                              key={index}
                              title={`Day ${index + 1}: ${status}`}
                              className={`w-6 h-6 rounded border flex items-center justify-center text-[10px] font-bold cursor-default ${
                                status === "PRESENT"
                                  ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                                  : status === "ABSENT"
                                    ? "bg-red-50 border-red-200 text-red-600"
                                    : status === "LATE"
                                      ? "bg-amber-50 border-amber-200 text-amber-600"
                                      : "bg-slate-50 border-slate-200 text-slate-500"
                              }`}
                            >
                              {status === "PRESENT" ? "P" : status === "ABSENT" ? "A" : status === "LATE" ? "L" : "H"}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-slate-700 text-sm">
                        {s.totalPresent}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-700 text-sm">
                        {s.totalAbsent}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-700 text-sm">
                        {s.totalLate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {s.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
