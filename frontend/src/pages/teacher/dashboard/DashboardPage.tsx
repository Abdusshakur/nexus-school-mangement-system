import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  CalendarCheck,
  ClipboardList,
  ArrowRight,
  Award,
} from "lucide-react";

import { StatCard } from "../../../components/dashboard/StatCard";
import { ScheduleCard } from "./ScheduleCard";
import {
  recentActivity,
  notifications,
  quickActions,
} from "./data";

import { useAuthStore } from "../../../store/auth";
import { useTimetableStore } from "../../../store/timetable.store";
import { useSessionStore } from "../../../store/session.store";
import { useTeacherContextStore } from "../../../store/teacherContext.store";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getTeacherTodayStatus, teacherCheckIn, teacherCheckOut } from "../../../api/attendance";
import { QRScannerModal } from "../../../components/dashboard/QRScannerModal";
import { ScanFace } from "lucide-react";

function getScheduleColors(subjectName: string) {
  const hash = (subjectName || "").split("").reduce((a, b) => a + b.charCodeAt(0), 0);
  const colors = [
    { text: "text-indigo-600", bg: "bg-indigo-600", soft: "bg-indigo-50", border: "border-indigo-600", ring: "ring-indigo-600/20", divider: "bg-indigo-600/30" },
    { text: "text-emerald-600", bg: "bg-emerald-600", soft: "bg-emerald-50", border: "border-emerald-600", ring: "ring-emerald-600/20", divider: "bg-emerald-600/30" },
    { text: "text-rose-500", bg: "bg-rose-500", soft: "bg-rose-50", border: "border-rose-500", ring: "ring-rose-500/20", divider: "bg-rose-500/30" },
    { text: "text-amber-500", bg: "bg-amber-500", soft: "bg-amber-50", border: "border-amber-500", ring: "ring-amber-500/20", divider: "bg-amber-500/30" },
    { text: "text-blue-500", bg: "bg-blue-500", soft: "bg-blue-50", border: "border-blue-500", ring: "ring-blue-500/20", divider: "bg-blue-500/30" },
  ];
  return colors[hash % colors.length];
}

const PERIODS = [
  { id: 1, label: "Period 1", time: "8:00 - 8:50 AM" },
  { id: 2, label: "Period 2", time: "9:00 - 9:50 AM" },
  { id: 3, label: "Period 3", time: "10:00 - 10:50 AM" },
  { id: 4, label: "Break", time: "11:00 - 11:30 AM" },
  { id: 5, label: "Period 4", time: "11:30 AM - 12:20 PM" },
  { id: 6, label: "Period 5", time: "12:30 - 1:20 PM" },
  { id: 7, label: "Lunch", time: "1:20 - 2:00 PM" },
  { id: 8, label: "Period 6", time: "2:00 - 2:50 PM" },
  { id: 9, label: "Period 7", time: "3:00 - 3:50 PM" },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const todayDate = new Date();
  const todayStr = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const todayShortStr = todayDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const firstName = user?.first_name || "";

  const { academicSessions, fetchSessions } = useSessionStore();
  const { myTimetableGrid, fetchMyTimetable } = useTimetableStore();
  const { myAssignments, myStudents, fetchAllContext } = useTeacherContextStore();

  useEffect(() => {
    fetchSessions();
    fetchTodayStatus();
    fetchAllContext();
  }, [fetchSessions, fetchAllContext]);

  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [scannerAction, setScannerAction] = useState<"CHECK_IN" | "CHECK_OUT" | null>(null);

  const fetchTodayStatus = async () => {
    try {
      const data = await getTeacherTodayStatus();
      setTodayStatus(data);
    } catch (err) {
      console.error("Failed to fetch today status", err);
    }
  };

  const handleScan = async (token: string) => {
    if (!scannerAction) return;
    try {
      if (scannerAction === "CHECK_IN") {
        await teacherCheckIn(token);
        toast.success("Successfully Checked In!");
      } else {
        await teacherCheckOut(token);
        toast.success("Successfully Checked Out!");
      }
      setScannerAction(null);
      fetchTodayStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err.message || "Scan failed.");
    }
  };

  const activeTermId = academicSessions.find(s => s.status === "active")?.termId || "";

  useEffect(() => {
    if (activeTermId) {
      fetchMyTimetable(activeTermId);
    }
  }, [activeTermId, fetchMyTimetable]);

  const todaySchedule = useMemo(() => {
    const dayMap: Record<number, string> = {
      1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY", 4: "THURSDAY", 5: "FRIDAY",
    };
    const dayIndex = todayDate.getDay();
    // Default to MONDAY if it's weekend, just so dashboard isn't completely empty for demo
    const currentDayStr = dayMap[dayIndex] || "MONDAY";

    return PERIODS.map(p => {
      const cell = myTimetableGrid[`${currentDayStr}-${p.id}`];
      if (!cell) return null;
      
      const colors = getScheduleColors(cell.subject);
      return {
        subject: cell.subject,
        class: cell.className,
        time: p.time,
        room: cell.room || "TBD",
        colorText: colors.text,
        colorBg: colors.bg,
        colorSoft: colors.soft,
        colorBorder: colors.border,
        colorRing: colors.ring,
        colorDivider: colors.divider,
      };
    }).filter(Boolean) as any[];
  }, [myTimetableGrid]);

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl p-6 flex items-center justify-between bg-indigo-700">
        <div>
          <p className="font-bold text-white text-[22px]">
            {greeting}, {firstName} 👋
          </p>
          <p className="mt-1 text-sm text-indigo-200">{todayStr}</p>
          <p className="mt-3 text-sm text-indigo-100">
            You have <strong className="text-white">{todaySchedule.length} classes</strong> today.
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
          value={new Set(myAssignments.map(a => a.class_id)).size}
          icon={BookOpen}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          sub="Active this term"
        />
        <StatCard
          label="My Students"
          value={myStudents.length}
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
      </div>

      {/* Row 2: Schedule + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-slate-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900">Today's Schedule</h3>
              <p className="text-xs mt-0.5 text-slate-500">
                {todayShortStr} · {todaySchedule.length} classes
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
            {todaySchedule.length > 0 ? (
              todaySchedule.map((item, i) => (
                <ScheduleCard key={i} item={item} index={i} />
              ))
            ) : (
              <div className="py-8 text-center text-slate-500 text-sm">
                You have no classes scheduled for today.
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h3 className="font-semibold mb-4 text-slate-900">Attendance Scan</h3>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => setScannerAction("CHECK_IN")}
              disabled={todayStatus?.status === "CHECKED_IN"}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent text-center transition-all shadow-sm
                ${todayStatus?.status === "CHECKED_IN" 
                  ? "bg-slate-50 opacity-60 cursor-not-allowed" 
                  : "bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5"}`}
            >
              <ScanFace size={24} className={todayStatus?.status === "CHECKED_IN" ? "text-slate-400" : "text-white"} />
              <span className={`text-xs font-semibold leading-tight ${todayStatus?.status === "CHECKED_IN" ? "text-slate-500" : "text-white"}`}>
                {todayStatus?.status === "CHECKED_IN" ? "Checked In" : "Scan to Sign In"}
              </span>
            </button>
            <button
              onClick={() => setScannerAction("CHECK_OUT")}
              disabled={todayStatus?.status === "CHECKED_OUT" || todayStatus?.status === "NOT_STARTED"}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-transparent text-center transition-all shadow-sm
                ${todayStatus?.status === "CHECKED_OUT" || todayStatus?.status === "NOT_STARTED"
                  ? "bg-slate-50 opacity-60 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-0.5"}`}
            >
              <ScanFace size={24} className={todayStatus?.status === "CHECKED_OUT" || todayStatus?.status === "NOT_STARTED" ? "text-slate-400" : "text-white"} />
              <span className={`text-xs font-semibold leading-tight ${todayStatus?.status === "CHECKED_OUT" || todayStatus?.status === "NOT_STARTED" ? "text-slate-500" : "text-white"}`}>
                {todayStatus?.status === "CHECKED_OUT" ? "Checked Out" : "Scan to Sign Out"}
              </span>
            </button>
          </div>

          <h3 className="font-semibold mb-4 text-slate-900 border-t border-slate-100 pt-5">Quick Links</h3>
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

      {scannerAction && (
        <QRScannerModal
          action={scannerAction}
          onClose={() => setScannerAction(null)}
          onScan={handleScan}
        />
      )}
    </div>
  );
}
