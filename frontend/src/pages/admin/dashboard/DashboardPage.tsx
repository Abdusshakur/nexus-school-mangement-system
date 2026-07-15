import { ROUTES } from "../../../config/routes";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  GraduationCap,
  CalendarCheck,
  Megaphone,
  TrendingUp,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Triangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardSummary,
  type DashboardSummaryResponse,
} from "../../../api/dashboard";
import { toast } from "sonner";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: string;
  positive?: boolean;
  iconColorClass: string;
  iconBgClass: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  change,
  positive,
  iconColorClass,
  iconBgClass,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 flex items-start gap-4 transition-shadow hover:shadow-md border border-slate-200">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass}`}
      >
        <Icon size={22} className={iconColorClass} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-0.5 font-bold text-[26px] leading-none text-slate-900">
          {value}
        </p>
        {change && (
          <p
            className={`text-xs mt-1 font-medium flex items-center gap-1 ${positive ? "text-indigo-600" : "text-rose-600"}`}
          >
            <Triangle
              size={8}
              className={`fill-current shrink-0 ${positive ? "" : "rotate-180"}`}
            />
            <span>{change}</span>
          </p>
        )}
      </div>
    </div>
  );
}

const attendanceData = [
  { day: "Mon", present: 210, absent: 15 },
  { day: "Tue", present: 225, absent: 10 },
  { day: "Wed", present: 205, absent: 20 },
  { day: "Thu", present: 20, absent: 200 },
  { day: "Fri", present: 220, absent: 15 },
];

const recentStudents = [
  {
    id: "S001",
    name: "Amelia Johnson",
    grade: "Grade 10",
    status: "Active",
    initials: "AJ",
    bgClass: "bg-indigo-500",
  },
  {
    id: "S002",
    name: "Marcus Williams",
    grade: "Grade 8",
    status: "Active",
    initials: "MW",
    bgClass: "bg-indigo-500",
  },
  {
    id: "S003",
    name: "Sofia Rodriguez",
    grade: "Grade 11",
    status: "Active",
    initials: "SR",
    bgClass: "bg-amber-500",
  },
  {
    id: "S004",
    name: "Ethan Chen",
    grade: "Grade 9",
    status: "Inactive",
    initials: "EC",
    bgClass: "bg-rose-500",
  },
  {
    id: "S005",
    name: "Priya Patel",
    grade: "Grade 12",
    status: "Active",
    initials: "PP",
    bgClass: "bg-purple-500",
  },
];

const latestAnnouncements = [
  {
    id: "A1",
    title: "Science Fair Registration Open",
    date: "Jun 14, 2026",
    dotClass: "bg-rose-500",
    audience: "All Students",
  },
  {
    id: "A2",
    title: "Parent-Teacher Meeting — June 20",
    date: "Jun 13, 2026",
    dotClass: "bg-amber-500",
    audience: "All Parents",
  },
  {
    id: "A3",
    title: "Library Hours Extended for Finals",
    date: "Jun 12, 2026",
    dotClass: "bg-indigo-500",
    audience: "All",
  },
];

const quickActions = [
  {
    label: "Mark Today's Attendance",
    to: ROUTES.ADMIN.ATTENDANCE_MARK,
    icon: CalendarCheck,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
  {
    label: "Add New Student",
    to: ROUTES.ADMIN.STUDENT_ADD,
    icon: Users,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-100",
  },
  {
    label: "Create Announcement",
    to: ROUTES.ADMIN.ANNOUNCEMENT_CREATE,
    icon: Megaphone,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-100",
  },
  {
    label: "Generate Report",
    to: ROUTES.ADMIN.ATTENDANCE_REPORT,
    icon: TrendingUp,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-50",
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const currentDateString = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await getDashboardSummary();
        setMetrics(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message);

          if (err.message.includes("Session expired")) {
            navigate("/login");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-1/2 flex items-center justify-center">
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Dashboard</h1>
          <p className="text-sm mt-0.5 text-slate-500">
            {currentDateString} · Nexus Academy
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN.STUDENT_ADD}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        >
          <Plus size={16} /> Add Student
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Students"
          value={metrics?.students ?? 0}
          icon={Users}
          iconColorClass="text-indigo-500"
          iconBgClass="bg-indigo-50"
          change="Active profiles"
          // TODO: MAKE CHANGES DYNAMIC TO FETCH FROM API RESPONSE WEEKLY METRICS.
          positive
        />
        <StatCard
          label="Parents"
          value={metrics?.parents ?? 0}
          icon={UserCheck}
          iconColorClass="text-purple-500"
          iconBgClass="bg-purple-50"
          change="Active profiles"
          positive
        />
        <StatCard
          label="Teachers"
          value={metrics?.teachers ?? 0}
          icon={GraduationCap}
          iconColorClass="text-indigo-500"
          iconBgClass="bg-indigo-50"
        />
        <StatCard
          label="Attendance Today"
          value={`${metrics?.attendance_today.present ?? 0}/${metrics?.attendance_today.total ?? 0}`}
          icon={CalendarCheck}
          iconColorClass="text-amber-500"
          iconBgClass="bg-amber-50"
          change={`${metrics?.attendance_today.percentage ?? 0}% rate`}
          positive={(metrics?.attendance_today.percentage ?? 0) >= 75}
        />
        <StatCard
          label="Announcements"
          value={metrics?.active_announcements ?? 0}
          icon={Megaphone}
          iconColorClass="text-rose-500"
          iconBgClass="bg-rose-50"
        />
      </div>

      {/* Dashboard details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                Weekly Attendance
              </h3>
              <p className="text-xs mt-0.5 text-slate-500">
                This week · Mon–Fri
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />{" "}
                Present
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Absent
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={attendanceData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gradPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    className="text-indigo-500"
                    stopColor="currentColor"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    className="text-indigo-500"
                    stopColor="currentColor"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="gradAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    className="text-rose-400"
                    stopColor="currentColor"
                    stopOpacity={0.15}
                  />
                  <stop
                    offset="95%"
                    className="text-rose-400"
                    stopColor="currentColor"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-100"
              />
              <XAxis
                dataKey="day"
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "currentColor", fontSize: 12 }}
                className="text-slate-400"
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                wrapperClassName="bg-white border border-slate-200 rounded-lg text-xs shadow-md"
                contentStyle={{
                  backgroundColor: "var(--color-white, #ffffff)",
                  borderColor: "var(--color-slate-200, #E2E8F0)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="present"
                stroke="currentColor"
                strokeWidth={2}
                fill="url(#gradPresent)"
                className="text-indigo-500"
              />
              <Area
                type="monotone"
                dataKey="absent"
                stroke="currentColor"
                strokeWidth={2}
                fill="url(#gradAbsent)"
                className="text-rose-400"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all hover:bg-slate-50 hover:border-slate-200 text-slate-700 cursor-pointer group"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${action.bgClass}`}
                >
                  <action.icon size={16} className={action.colorClass} />
                </div>
                <span className="text-sm font-medium flex-1">
                  {action.label}
                </span>
                <ArrowRight size={14} className="text-slate-300" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent students table */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Students</h3>
            <Link
              to={ROUTES.ADMIN.STUDENTS}
              className="text-sm font-medium flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {["Student", "Grade", "Status"].map((students) => (
                  <th
                    key={students}
                    className="text-left px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {students}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-[11px] ${s.bgClass}`}
                      >
                        <span>{s.initials}</span>
                      </div>
                      <div>
                        <Link
                          to={ROUTES.ADMIN.STUDENT_DETAIL(s.id)}
                          className="text-sm font-medium transition-colors text-slate-900 hover:text-indigo-500"
                        >
                          {s.name}
                        </Link>
                        <p className="text-xs text-slate-400">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700">
                    {s.grade}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === "Active" ? "bg-indigo-100 text-indigo-800" : "bg-rose-100 text-rose-800"}`}
                    >
                      {s.status === "Active" ? (
                        <CheckCircle size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Announcements Tab */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Announcements</h3>
            <Link
              to={ROUTES.ADMIN.ANNOUNCEMENTS}
              className="text-sm font-medium flex items-center gap-1 text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div>
            {latestAnnouncements.map((ann) => (
              <Link
                key={ann.id}
                to="#"
                className="block px-5 py-4 transition-colors hover:bg-slate-50 border-t border-slate-100 first:border-t-0"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ann.dotClass}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug text-slate-900">
                      {ann.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={11} className="text-slate-400" />
                      <p className="text-xs text-slate-400">{ann.date}</p>
                      <span className="text-xs text-slate-400">·</span>
                      <p className="text-xs text-slate-400">{ann.audience}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
