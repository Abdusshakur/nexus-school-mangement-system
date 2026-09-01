import { useEffect, useState } from "react";
import { ROUTES } from "../../../config/routes";
import { Link } from "react-router-dom";
import { CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  fetchAttendanceTrends,
  type DailyAttendance,
} from "../../../api/dashboard";
import { fetchDailyAttendanceSummary, type DailyAttendanceSummaryResponse } from "../../../api/attendance";
import { Skeleton } from "../../../components/ui/Skeleton";

export function AttendanceDashboard() {
  const [trendsData, setTrendsData] = useState<DailyAttendance[]>([]);
  const [summaryData, setSummaryData] = useState<DailyAttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAttendanceTrends().then(setTrendsData).catch(console.error),
      fetchDailyAttendanceSummary().then(setSummaryData).catch(console.error),
    ]).finally(() => setLoading(false));
  }, []);

  const currentDateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="flex-1 flex flex-col min-w-0 ">
      <header className=" flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold ">Attendance</h1>
          <p className="text-slate-500 text-sm mt-0.5">{currentDateString}</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Link
            to={ROUTES.ADMIN.ATTENDANCE_MARK}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
          >
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Mark Today</span>
            <span className="sm:hidden">Mark</span>
          </Link>
          <Link
            to={ROUTES.ADMIN.ATTENDANCE_REPORT}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4 sm:py-2.5 border border-slate-200 bg-white text-slate-600 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
            <span className="hidden sm:inline">Performance Report</span>
            <span className="sm:hidden">Report</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 space-y-6 max-w-full w-full ">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            ))
          ) : (
            [
              {
                label: "Present Today",
                value: summaryData?.classes.reduce((sum, c) => sum + c.total_present, 0) || 0,
                icon: CheckCircle,
                text: "text-indigo-500",
                bg: "bg-indigo-100",
              },
              {
                label: "Absent Today",
                value: summaryData?.classes.reduce((sum, c) => sum + c.total_absent, 0) || 0,
                icon: XCircle,
                text: "text-red-500",
                bg: "bg-red-100",
              },
              {
                label: "Late Arrivals",
                value: summaryData?.classes.reduce((sum, c) => sum + c.total_late, 0) || 0,
                icon: Clock,
                text: "text-amber-500",
                bg: "bg-amber-100",
              },
              {
                label: "Attendance Rate",
                value: summaryData?.classes.length
                  ? `${Math.round(summaryData.classes.reduce((sum, c) => sum + c.attendance_rate_percentage, 0) / summaryData.classes.length)}%`
                  : "0%",
                icon: TrendingUp,
                text: "text-indigo-500",
                bg: "bg-indigo-100",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}
                >
                  <s.icon size={22} className={s.text} />
                </div>
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className="font-extrabold text-slate-900 mt-0.5 text-2xl">
                    {s.value}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Monthly Attendance Overview
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Live campus aggregate registration stats
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={trendsData.length > 0 ? trendsData : []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 12, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "none",
                    borderRadius: 12,
                    color: "#F8FAFC",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="present"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  name="Present"
                />
                <Bar
                  dataKey="absent"
                  fill="#FCA5A5"
                  radius={[4, 4, 0, 0]}
                  name="Absent"
                />
                <Bar
                  dataKey="late"
                  fill="#FCD34D"
                  radius={[4, 4, 0, 0]}
                  name="Late"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="font-extrabold text-slate-900 text-lg">
              Roll Attendance Rate By Grade
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Today's active registers and ratios
            </p>
          </div>
          <div className="space-y-4">
            {summaryData?.classes.map((g) => (
              <div
                key={g.class_id}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-24 text-sm text-slate-700 font-bold flex flex-col">
                  <span>{g.class_name}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {g.session_status}
                  </span>
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${g.attendance_rate_percentage >= 90
                      ? "bg-indigo-500"
                      : g.attendance_rate_percentage >= 85
                        ? "bg-indigo-500"
                        : "bg-amber-500"
                      }`}
                    style={{
                      width: `${g.attendance_rate_percentage}%`,
                    }}
                  />
                </div>
                <div className="w-full sm:w-28 text-left sm:text-right shrink-0 flex items-center justify-between sm:block">
                  <span className="text-sm font-bold text-slate-800">
                    {g.total_present + g.total_late} / {g.total_students}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">
                    ({Math.round(g.attendance_rate_percentage)}%)
                  </span>
                </div>
              </div>
            ))}
            {!summaryData?.classes.length && (
              <p className="text-sm text-slate-500">No classes found.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
