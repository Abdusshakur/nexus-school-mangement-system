import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Award,
} from "lucide-react";

import { StatCard } from "../../../components/dashboard/StatCard";
import { ScheduleCard } from "./ScheduleCard";
import {
  todaySchedule,
  recentActivity,
  notifications,
  quickActions,
} from "./data";

import { useAuthStore } from "../../../store/auth";

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstName = user?.first_name || "";

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between bg-indigo-700">
        <div>
          <p className="font-bold text-white text-[22px]">
            {greeting}, {firstName} 👋
          </p>
          <p className="mt-1 text-sm text-indigo-200">{today}</p>
          <p className="mt-3 text-sm text-indigo-100">
            You have <strong className="text-white">4 classes</strong> today and{" "}
            <strong className="text-white">3 pending assignments</strong> to
            review.
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white/15">
            <Award size={36} className="text-white" />
          </div>
        </div>
      </div>

      {/* stat cards  */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          label="Classes Assigned"
          value={4}
          icon={BookOpen}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          sub="Active this term"
        />
        <StatCard
          label="My Students"
          value={148}
          icon={Users}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50"
          sub="Across all classes"
        />
        <StatCard
          label="Attendance Rate"
          value="91%"
          icon={CalendarCheck}
          iconColor="text-indigo-500"
          iconBg="bg-indigo-50"
          sub="This week"
        />
        <StatCard
          label="Pending Tasks"
          value={3}
          icon={ClipboardList}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          sub="Assignments to grade"
        />
        {/* Reserved future slots */}
        <div className="bg-white rounded-xl p-5 flex items-center justify-center border-2 border-dashed border-slate-200">
          <div className="text-center">
            <TrendingUp size={22} className="text-slate-300 mx-auto mb-1" />
            <p className="text-xs text-slate-300">Performance</p>
            <p className="text-xs text-slate-300">Coming soon</p>
          </div>
        </div>
      </div>

      {/* Row 2: Schedule + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Today's Schedule</h3>
              <p className="text-xs mt-0.5 text-slate-500">
                Monday, June 15 · 4 classes
              </p>
            </div>
            <Link
              to="/teacher/classes"
              className="text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              All classes <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4 space-y-3">
            {todaySchedule.map((item, i) => (
              <ScheduleCard key={i} item={item} index={i} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-900">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent text-center transition-all hover:-translate-y-0.5 hover:shadow-md ${action.hoverBg}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.colorBg}`}
                >
                  <action.icon size={18} className={action.colorText} />
                </div>
                <span className="text-xs font-semibold leading-tight text-slate-700">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Activity + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${act.colorSoft}`}
                >
                  <act.icon size={15} className={act.colorText} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{act.text}</p>
                  <p className="text-xs mt-0.5 text-slate-400">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-500">
              {notifications.length} new
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.map((n, i) => (
              <div
                key={i}
                className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.dotColor}`}
                />
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.iconBg}`}
                >
                  <n.icon size={15} className={n.iconColor} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{n.text}</p>
                  <p className="text-xs mt-0.5 text-slate-400">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
