import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Calendar,
  QrCode,
  AlertCircle,
  TrendingUp,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTeacherTodayStatus,
  teacherCheckIn,
  teacherCheckOut,
} from "../../../api/attendance";
import {
  fetchMyAttendanceStats,
  fetchMyAttendanceHistory,
  type TeacherAttendanceStatsResponse,
  type TeacherAttendanceHistoryItem,
} from "../../../api/teacherContext";
import { QRScannerModal } from "../../../components/dashboard/QRScannerModal";

// Time formater
const formatTime = (isoString?: string) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function getWorkingDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      days.push(`${yyyy}-${mm}-${dd}`);
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function formatDateDisplay(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Removed duplicate formatTime

export default function MyAttendancePage() {
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [scannerAction, setScannerAction] = useState<
    "CHECK_IN" | "CHECK_OUT" | null
  >(null);

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const [monthStats, setMonthStats] = useState<TeacherAttendanceStatsResponse | null>(null);
  const [monthHistory, setMonthHistory] = useState<TeacherAttendanceHistoryItem[]>([]);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  useEffect(() => {
    // Backend expects month 1-12
    const m = viewMonth + 1;
    fetchMyAttendanceStats(viewYear, m)
      .then(setMonthStats)
      .catch(console.error);

    const sYear = viewYear;
    const sMonth = String(viewMonth + 1).padStart(2, '0');
    const start_date = `${sYear}-${sMonth}-01`;

    const lastDay = new Date(viewYear, viewMonth + 1, 0).getDate();
    const end_date = `${sYear}-${sMonth}-${String(lastDay).padStart(2, '0')}`;
    
    fetchMyAttendanceHistory(start_date, end_date)
      .then(setMonthHistory)
      .catch(console.error);
  }, [viewYear, viewMonth]);

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

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    },
  );

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    const isCurrentMonth =
      viewYear === now.getFullYear() && viewMonth === now.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const allWorkingDays = getWorkingDaysInMonth(viewYear, viewMonth);
  const nowYYYY = now.getFullYear();
  const nowMM = String(now.getMonth() + 1).padStart(2, '0');
  const nowDD = String(now.getDate()).padStart(2, '0');
  const todayISO = `${nowYYYY}-${nowMM}-${nowDD}`;
  const workingDays = isCurrentMonth
    ? allWorkingDays.filter((d) => d <= todayISO)
    : allWorkingDays;

  // Real backend check-in data mapped to the required format
  const checkInMap = Object.fromEntries(
    monthHistory.map((c) => [
      c.attendance_date, 
      {
        date: c.attendance_date,
        checkInTime: c.check_in_at ? formatTime(c.check_in_at) : "—",
        status: c.status === "MISSED_CHECK_IN" ? "absent" : (c.is_late ? "late" : "present")
      }
    ])
  );

  const presentDays = monthStats?.present_days || 0;
  const lateDays = monthStats?.late_days || 0;
  const absentDays = monthStats?.absent_days || 0;
  const totalWorkingDays = monthStats?.total_working_days || 0;
  const attendanceRate = monthStats?.attendance_rate || 0;

  // Collect all unique dates from workingDays AND from the backend history
  const allDatesSet = new Set(workingDays);
  Object.keys(checkInMap).forEach((d) => allDatesSet.add(d));
  const allSortedDates = Array.from(allDatesSet).sort((a, b) => (a < b ? 1 : -1));

  const tableRows = allSortedDates.map((day) => {
    const record = checkInMap[day];
    return {
      date: day,
      checkInTime: record ? record.checkInTime : "—",
      status: record ? record.status : "absent",
    };
  });

  const isCheckedIn =
    todayStatus?.status === "CHECKED_IN" || todayStatus?.status === "LATE";
  const checkInTimeStr = formatTime(todayStatus?.check_in_at);
  const statusStr = todayStatus?.status === "LATE" ? "Late" : "Present";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Record your daily arrival and view your attendance statistics
        </p>
      </div>

      {isCheckedIn ? (
        /* Already checked in */
        <div className="flex flex-col gap-5">
          {/* Success Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-700" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Checked In ✓</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Today's attendance has been successfully recorded.
            </p>

            {/* Check-in details */}
            <div className="flex justify-center gap-12 mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                  <Clock size={14} />
                  Check-in Time
                </div>
                <div className="text-lg font-bold text-teal-600">
                  {checkInTimeStr}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                  <Calendar size={14} />
                  Status
                </div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-0.5
                    ${todayStatus?.status === "LATE" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}
                  `}
                >
                  {statusStr}
                </span>
              </div>
            </div>

            {/* Check Out Button if they haven't checked out */}
            {todayStatus?.status !== "CHECKED_OUT" && (
              <div className="mt-8 border-t border-slate-100 pt-6">
                <button
                  onClick={() => setScannerAction("CHECK_OUT")}
                  className="bg-slate-900 hover:bg-slate-800 text-white border-none rounded-lg px-6 py-2.5 text-sm font-semibold cursor-pointer inline-flex items-center gap-2 transition-colors"
                >
                  <QrCode size={16} />
                  Scan to Check Out
                </button>
              </div>
            )}
            {todayStatus?.status === "CHECKED_OUT" && (
              <div className="mt-6">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                  Checked Out at {formatTime(todayStatus?.check_out_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Not yet checked in */
        <div className="flex flex-col gap-5">
          {/* Today's status banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 px-5 flex items-center gap-3 shadow-sm">
            <AlertCircle size={18} className="text-slate-400" />
            <span className="text-slate-700 text-sm font-medium">
              Today's status:
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
              Not Checked In
            </span>
          </div>

          {/* QR Scanner Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-2">
              <QrCode size={22} className="text-teal-600" />
              <h2 className="text-xl font-bold text-slate-900">
                Teacher Check-In
              </h2>
            </div>
            <p className="text-slate-500 text-sm mb-7">
              Scan the school's QR code to record your arrival
            </p>

            {/* Scan Button */}
            <button
              onClick={() => setScannerAction("CHECK_IN")}
              className="bg-teal-600 hover:bg-teal-700 text-white border-none rounded-xl px-8 py-3 text-sm font-semibold cursor-pointer inline-flex items-center gap-2 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <QrCode size={18} />
              Scan & Check In
            </button>

            <p className="text-slate-400 text-xs mt-6 font-medium">
              QR code is controlled by school administration and refreshes daily
            </p>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={prevMonth}
          className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft size={16} className="text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-teal-600" />
          <span className="font-semibold text-slate-900 text-sm">
            {monthLabel}
          </span>
        </div>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className={`p-1.5 border border-slate-200 rounded-lg transition-colors
            ${isCurrentMonth ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50 cursor-pointer"}
          `}
        >
          <ChevronRight size={16} className="text-slate-700" />
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Attendance Rate",
            value: `${attendanceRate}%`,
            icon: TrendingUp,
            color: "text-teal-600",
            bg: "bg-teal-50",
            iconCol: "text-teal-700",
          },
          {
            label: "Present Days",
            value: presentDays,
            icon: Calendar,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            iconCol: "text-emerald-800",
          },
          {
            label: "Late Days",
            value: lateDays,
            icon: Clock,
            color: "text-amber-700",
            bg: "bg-amber-50",
            iconCol: "text-amber-800",
          },
          {
            label: "Absent Days",
            value: absentDays,
            icon: XCircle,
            color: "text-red-700",
            bg: "bg-red-50",
            iconCol: "text-red-800",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}
                >
                  <Icon size={16} className={stat.iconCol} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Daily Attendance Records
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
            {totalWorkingDays} working days
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Check-in Time
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-12 text-center text-slate-400 text-sm"
                  >
                    No working days recorded for this month.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                      {formatDateDisplay(row.date)}
                    </td>
                    <td
                      className={`px-5 py-3.5 text-sm font-mono ${row.checkInTime === "—" ? "text-slate-400" : "text-slate-700 font-semibold"}`}
                    >
                      {row.checkInTime}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold
                        ${row.status === "present" ? "bg-emerald-100 text-emerald-700" : ""}
                        ${row.status === "late" ? "bg-amber-100 text-amber-700" : ""}
                        ${row.status === "absent" ? "bg-red-100 text-red-700" : ""}
                      `}
                      >
                        {row.status.charAt(0).toUpperCase() +
                          row.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reused Scanner Modal */}
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
