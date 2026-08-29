import { useState, useEffect } from "react";
import { CheckCircle, Clock, Calendar, QrCode, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getTeacherTodayStatus, teacherCheckIn, teacherCheckOut } from "../../../api/attendance";
import { QRScannerModal } from "../../../components/dashboard/QRScannerModal";

// A neat utility to format times
const formatTime = (isoString?: string) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Removed QRVisual as teachers scan codes, they do not display them.

export default function MyAttendancePage() {
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [scannerAction, setScannerAction] = useState<"CHECK_IN" | "CHECK_OUT" | null>(null);

  useEffect(() => {
    fetchTodayStatus();
  }, []);

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

  // MOCK STATS for Monthly Summary (To be replaced when backend endpoint is ready)
  const monthlyStats = {
    attendanceRate: 94,
    presentDays: 16,
    lateDays: 2,
    absentDays: 1,
  };

  const isCheckedIn = todayStatus?.status === "CHECKED_IN" || todayStatus?.status === "LATE";
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
            
            {/* Optional Check Out Button if they haven't checked out yet */}
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

          {/* Monthly Stats */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-5">
              This Month's Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Attendance Rate",
                  value: `${monthlyStats.attendanceRate}%`,
                  color: "text-teal-600",
                  bg: "bg-teal-50",
                },
                {
                  label: "Present Days",
                  value: monthlyStats.presentDays,
                  color: "text-emerald-700",
                  bg: "bg-emerald-50",
                },
                {
                  label: "Late Days",
                  value: monthlyStats.lateDays,
                  color: "text-amber-700",
                  bg: "bg-amber-50",
                },
                {
                  label: "Absent Days",
                  value: monthlyStats.absentDays,
                  color: "text-red-700",
                  bg: "bg-red-50",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl p-4 text-center ${stat.bg}`}
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-4 uppercase tracking-wider font-semibold">
              * Mock data shown until backend API is available
            </p>
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
