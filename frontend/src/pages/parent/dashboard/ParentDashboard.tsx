import { useState } from "react";
import {
  CalendarCheck,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Bell,
  ClipboardList,
  Star,
} from "lucide-react";
import { mockProfile, mockAssignments, mockNotifications } from "./data";
import { StatCard } from "../../../components/dashboard/StatCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-indigo-100 text-indigo-800",
};

export function ParentDashboard() {
  const profile = mockProfile;
  const children = profile.children;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedChild = children[selectedIdx];

  // Stats for selected child
  const childAssignments = mockAssignments.filter(
    (a) => a.classId === selectedChild?.classId && a.status === "published",
  );
  const recentAssignments = [...childAssignments]
    .sort(
      (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
    )
    .slice(0, 3);

  // Notifications for this parent
  const myNotifications = mockNotifications
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 font-inter">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between bg-indigo-600 shadow-sm">
        <div>
          <p className="font-bold text-white text-xl">
            {greeting}, {profile.name} 👋
          </p>
          <p className="mt-2 text-sm text-indigo-100">
            Here&apos;s what&apos;s happening with your children today.
          </p>
          <p className="mt-1 text-xs text-indigo-200">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="hidden md:flex w-16 h-16 rounded-full items-center justify-center shrink-0 bg-white/10">
          <GraduationCap size={30} className="text-white" />
        </div>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((child, i) => (
            <button
              key={child.admNo}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                i === selectedIdx
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {child.name}
              <span className="ml-1.5 text-xs opacity-80">
                ({child.className})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      {selectedChild && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Attendance Rate"
            value="94%"
            sub="This term"
            icon={CalendarCheck}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
          />
          <StatCard
            label="Assignments"
            value={childAssignments.length}
            sub="Published this term"
            icon={ClipboardList}
            iconColor="text-violet-600"
            iconBg="bg-violet-50"
          />
          <StatCard
            label="Current Average"
            value="78%"
            sub="Across all subjects"
            icon={TrendingUp}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />
          <StatCard
            label="Class"
            value={selectedChild.className}
            sub={`Adm: ${selectedChild.admNo}`}
            icon={BookOpen}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
      )}

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <CalendarCheck size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Attendance
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <ClipboardList size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Assignments
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Star size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Results
            </span>
          </button>

          <button className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Bell size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Notifications
            </span>
          </button>
        </div>
      </div>

      {/* Row: Recent Assignments + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assignments */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Assignments</h3>
            <span className="text-sm font-medium flex items-center gap-1 text-indigo-600 cursor-not-allowed opacity-50">
              View all
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {recentAssignments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <ClipboardList
                  size={28}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-sm text-slate-400">
                  No assignments yet for {selectedChild?.className}
                </p>
              </div>
            ) : (
              recentAssignments.map((a) => {
                const ps = PRIORITY_STYLES[a.priority];
                const isOverdue = new Date(a.dueDate) < new Date();
                return (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 px-5 py-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50">
                      <BookOpen size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {a.title}
                      </p>
                      <p className="text-xs mt-0.5 text-slate-500">
                        {a.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${ps}`}
                        >
                          {a.priority}
                        </span>
                        <span
                          className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-slate-400"}`}
                        >
                          Due {formatDate(a.dueDate)}
                          {isOverdue ? " · Overdue" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              Recent Notifications
            </h3>
            <span className="text-sm font-medium flex items-center gap-1 text-indigo-600 cursor-not-allowed opacity-50">
              View all
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {myNotifications.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No notifications yet</p>
              </div>
            ) : (
              myNotifications.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full shrink-0 mt-2 bg-indigo-500" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-slate-100" : "bg-indigo-50"}`}
                  >
                    <Bell
                      size={14}
                      className={n.read ? "text-slate-400" : "text-indigo-600"}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${n.read ? "text-slate-600" : "text-slate-900 font-medium"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs mt-0.5 line-clamp-2 text-slate-500">
                      {n.message}
                    </p>
                    <p className="text-[11px] mt-1 text-slate-400 font-medium">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
