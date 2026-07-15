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
import { weeklyData } from "./data";

export function AttendanceDashboard() {
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
        <div className="flex gap-3">
          <Link
            to={ROUTES.ADMIN.ATTENDANCE_MARK}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10"
          >
            <CheckCircle size={16} /> Mark Today
          </Link>
          <Link
            to={ROUTES.ADMIN.ATTENDANCE_REPORT}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            <TrendingUp size={16} /> Performance Report
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 space-y-6 max-w-full w-full ">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              label: "Present Today",
              value: 220,
              icon: CheckCircle,
              text: "text-indigo-500",
              bg: "bg-indigo-100",
            },
            {
              label: "Absent Today",
              value: 18,
              icon: XCircle,
              text: "text-red-500",
              bg: "bg-red-100",
            },
            {
              label: "Late Arrivals",
              value: 12,
              icon: Clock,
              text: "text-amber-500",
              bg: "bg-amber-100",
            },
            {
              label: "Attendance Rate",
              value: "88%",
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
          ))}
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
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="week"
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
            {[
              { grade: "Grade 7", total: 32, present: 29, rate: 91 },
              { grade: "Grade 8", total: 38, present: 33, rate: 87 },
              { grade: "Grade 9", total: 41, present: 37, rate: 90 },
              { grade: "Grade 10", total: 45, present: 40, rate: 89 },
              { grade: "Grade 11", total: 50, present: 43, rate: 86 },
              { grade: "Grade 12", total: 44, present: 38, rate: 86 },
            ].map((g) => (
              <div
                key={g.grade}
                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="w-24 text-sm text-slate-700 font-bold">
                  {g.grade}
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      g.rate >= 90
                        ? "bg-indigo-500"
                        : g.rate >= 85
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                    }`}
                    style={{
                      width: `${g.rate}%`,
                    }}
                  />
                </div>
                <div className="w-28 text-right shrink-0">
                  <span className="text-sm font-bold text-slate-800">
                    {g.present} / {g.total}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 ml-1.5">
                    ({g.rate}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
