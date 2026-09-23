import {
  CalendarCheck,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Bell,
  ClipboardList,
  Star,
} from "lucide-react";

import { Link } from "react-router-dom";
import { StatCard } from "../../../components/dashboard/StatCard";
import { useParentContextStore } from "../../../store/parentContext.store";
import { useEffect, useState } from "react";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  fetchAnnouncements,
  type AnnouncementResponse,
} from "../../../api/announcements";

export function ParentDashboard() {
  const {
    profile,
    children,
    selectedChildId,
    childResults,
    childAttendance,
    loadingProfile,
    loadingChildren,
    loadProfile,
    loadChildren,
    loadChildAttendance,
    selectChild,
    error,
  } = useParentContextStore();

  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    loadProfile();
    loadChildren();
  }, [loadProfile, loadChildren]);

  useEffect(() => {
    if (selectedChildId && !childAttendance[selectedChildId]) {
      loadChildAttendance(selectedChildId);
    }
  }, [selectedChildId, childAttendance, loadChildAttendance]);

  useEffect(() => {
    fetchAnnouncements("PUBLISHED")
      .then((data) => setAnnouncements(data.slice(0, 3))) // Only show 3 ann on dashboard
      .catch((err) => console.error("Failed to load announcements", err))
      .finally(() => setLoadingAnnouncements(false));
  }, []);

  if (loadingProfile || loadingChildren) {
    return (
      <div className="space-y-6">
        {/* Banner Skeleton */}
        <Skeleton className="h-32 w-full rounded-2xl" />

        {/* Child Selector Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>

        {/* Stat Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>

        {/* Quick Links Skeleton */}
        <div>
          <Skeleton className="h-6 w-32 mb-3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>

        {/* Recent Results Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-slate-500 gap-2">
        <p>Profile not found or you do not have parent access.</p>
        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      </div>
    );
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  // Stats for selected child
  const results = selectedChild ? childResults[selectedChild.id] || [] : [];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 font-inter">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between bg-indigo-600 shadow-sm">
        <div>
          <p className="font-bold text-white text-xl">
            {greeting}, {profile.first_name || "Parent"} 👋
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
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => selectChild(child.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${child.id === selectedChildId
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
            >
              {child.first_name} {child.last_name}
              <span className="ml-1.5 text-xs opacity-80">
                ({child.class_name})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stat cards */}
      {selectedChild && (() => {
        const attendance = childAttendance[selectedChild.id] || [];
        const presentDays = attendance.filter(a => a.status === "PRESENT").length;
        const totalDays = attendance.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) + "%" : "--";

        const currentAvg = results.length > 0 ? Math.round(results[0].term_result.average_score) + "%" : "--";

        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Attendance Rate"
              value={attendanceRate}
              sub="This term"
              icon={CalendarCheck}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-50"
            />
            <StatCard
              label="Results"
              value={results.length}
              sub="Terms published"
              icon={ClipboardList}
              iconColor="text-violet-600"
              iconBg="bg-violet-50"
            />
            <StatCard
              label="Current Average"
              value={currentAvg}
              sub="Most recent term"
              icon={TrendingUp}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <StatCard
              label="Class"
              value={selectedChild.class_name}
              sub={`Adm: ${selectedChild.admission_number || "N/A"}`}
              icon={BookOpen}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>
        );
      })()}

      {/* Quick Links */}
      <div>
        <h3 className="font-semibold text-slate-900 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/parent/attendance"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <CalendarCheck size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Attendance
            </span>
          </Link>

          <div className="relative flex flex-col items-center justify-center p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm opacity-60">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
              <ClipboardList size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">
              Assignments
            </span>
            <span className="absolute -top-2 right-2 text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              Soon
            </span>
          </div>

          <Link
            to="/parent/results"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Star size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Results
            </span>
          </Link>

          <Link
            to="/parent/announcements"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow hover:border-indigo-300 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
              <Bell size={20} className="text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
              Announcements
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Results / Activity Notification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Results */}
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Results</h3>
            <span className="text-sm font-medium flex items-center gap-1 text-indigo-600 cursor-not-allowed opacity-50">
              View all
            </span>
          </div>
          <div className="divide-y divide-slate-50">
            {results.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Star
                  size={28}
                  className="mx-auto mb-2 text-slate-300"
                />
                <p className="text-sm text-slate-400">
                  No published results for {selectedChild?.first_name}
                </p>
              </div>
            ) : (
              results.slice(0, 3).map((r) => {
                return (
                  <div
                    key={r.term_result.id}
                    className="flex items-start gap-3 px-5 py-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-indigo-50">
                      <BookOpen size={14} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {r.term_result.academic_term_name}
                      </p>
                      <p className="text-xs mt-0.5 text-slate-500">
                        Session: {r.term_result.academic_session_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {r.term_result.status}
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
              Recent Announcements
            </h3>
            <Link
              to="/parent/announcements"
              className="text-sm font-medium flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingAnnouncements ? (
              <div className="p-5 space-y-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Bell size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-400">No recent announcements</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ann.audience}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ann.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short"
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 mb-1">{ann.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{ann.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
