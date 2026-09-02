import { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useQRAttendanceStore } from "../../store/qrAttendance.store";
import { useTeacherStore } from "../../store/teacher.store";
import { Spinner } from "../ui/Spinner";
import { Skeleton } from "../ui/Skeleton";

function formatDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface TeacherQRScannerProps {
  isAdmin?: boolean;
}

export function TeacherQRScanner({ isAdmin = false }: TeacherQRScannerProps) {
  const { teacherCheckIns, currentQRSession, generateQRSession } =
    useQRAttendanceStore();
  const { teachers, loading, fetchTeachers } = useTeacherStore();

  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (!currentQRSession && isAdmin) {
      generateQRSession();
    }
  }, [currentQRSession, isAdmin, generateQRSession]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!currentQRSession?.expiresAt) return;

      const now = Date.now();
      const expires = new Date(currentQRSession.expiresAt).getTime();
      const remainingSeconds = Math.max(0, Math.floor((expires - now) / 1000));

      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0 && isAdmin) {
        generateQRSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQRSession, isAdmin, generateQRSession]);

  const todayISO = new Date().toISOString().slice(0, 10);
  const totalTeachers = teachers.length;

  const teacherStatus = teachers.map((t) => {
    let record = teacherCheckIns.find(
      (c) => c.teacherId === t.id && c.date === todayISO,
    );

    return { teacher: t, record };
  });

  const checkedInCount = teacherStatus.filter((t) => t.record).length;
  const presentToday = teacherStatus.filter(
    (t) => t.record?.status === "present",
  ).length;
  const lateToday = teacherStatus.filter(
    (t) => t.record?.status === "late",
  ).length;
  const absentToday = totalTeachers - checkedInCount;

  const qrToken = currentQRSession?.token;
  const displayDate = currentQRSession?.date
    ? formatDate(currentQRSession.date)
    : formatDate(todayISO);

  const teacherRates = teachers.map((t) => {
    const allCheckIns = teacherCheckIns.filter((c) => c.teacherId === t.id);
    const rate =
      allCheckIns.length > 0
        ? Math.min(100, Math.round((allCheckIns.length / 20) * 100))
        : 0;
    return { teacher: t, rate };
  });

  const overallAttendanceRate =
    totalTeachers > 0 ? Math.round((checkedInCount / totalTeachers) * 100) : 0;

  const getStatusBadge = (record: (typeof teacherStatus)[0]["record"]) => {
    if (!record)
      return { label: "Not yet", bg: "bg-slate-100", text: "text-slate-500" };
    if (record.status === "present")
      return {
        label: "Present",
        bg: "bg-emerald-100",
        text: "text-emerald-800",
      };
    return { label: "Late", bg: "bg-amber-100", text: "text-amber-800" };
  };

  return (
    <div className="p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Teacher Attendance Management
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage QR check-in sessions and monitor teacher attendance
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* QR Code */}
          <div className="bg-white p-2 sm:p-3 border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-sm shrink-0 w-[200px] h-[200px] sm:w-[248px] sm:h-[248px]">
            {loading ? (
              <Skeleton className="w-full h-full rounded-lg" />
            ) : qrToken ? (
              <QRCodeSVG value={qrToken} width="100%" height="100%" level="H" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                <Spinner size="lg" className="text-indigo-500" />
                <span className="text-xs font-semibold">Generating...</span>
              </div>
            )}
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            {loading ? (
              <div className="space-y-4 max-w-sm mt-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-40 mt-4 rounded-full" />
                <Skeleton className="h-5 w-5/6 mt-4" />
                {isAdmin && <Skeleton className="h-10 w-48 mt-4 rounded-xl" />}
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-slate-900 mb-1">
                  Today's Teacher Check-In
                </h2>
                <p className="text-sm text-slate-500 mb-5">{displayDate}</p>

                <div className="mb-6 flex justify-center md:justify-start">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    Resets in {Math.floor(timeLeft / 60)}m {timeLeft % 60}s
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-[15px] font-semibold text-slate-900">
                    {checkedInCount} / {totalTeachers} Teachers Checked In Today
                  </div>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => generateQRSession()}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-lg sm:rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold cursor-pointer transition-colors w-full sm:w-auto mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Regenerate <span className="hidden sm:inline">QR Manually</span></span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-slate-500">
                    Overall Rate
                  </span>
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
                    <TrendingUp size={18} className="text-indigo-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {overallAttendanceRate}%
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-slate-500">
                    Present
                  </span>
                  <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircle size={18} className="text-emerald-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-700">
                  {presentToday}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-slate-500">
                    Late
                  </span>
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
                    <Clock size={18} className="text-amber-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-700">
                  {lateToday}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[13px] font-medium text-slate-500">
                    Absent
                  </span>
                  <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
                    <XCircle size={18} className="text-red-700" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {absentToday}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-[15px] font-bold text-slate-900 mb-5">
                Attendance by Teacher
              </h3>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-4 w-8" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                      </div>
                    ))}
                  </>
                ) : teacherRates.map(({ teacher, rate }) => (
                  <div key={teacher.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                          {teacher.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {teacher.name}
                        </span>
                      </div>
                      <span className="text-[13px] font-bold text-indigo-600">
                        {rate}%
                      </span>
                    </div>
                    <div className="h-2 bg-indigo-50 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${rate >= 90 ? "bg-indigo-600" : rate >= 70 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div
          className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-3"} bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col`}
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Users size={18} className="text-indigo-600" />
              <h3 className="text-[15px] font-bold text-slate-900">
                Live Check-In Status
              </h3>
            </div>
            <span className="text-[12px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-0.5">
              {todayISO}
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      </tr>
                    ))}
                  </>
                ) : teacherStatus.map(({ teacher, record }, idx) => {
                  const badge = getStatusBadge(record);
                  return (
                    <tr
                      key={teacher.id}
                      className={idx > 0 ? "border-t border-slate-100" : ""}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-[14px] font-medium text-slate-900">
                            {teacher.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-slate-600">
                        {teacher.dept}
                      </td>
                      <td
                        className={`px-5 py-3.5 text-[13px] ${record ? "font-mono text-slate-700" : "text-slate-400"}`}
                      >
                        {record ? record.checkInTime : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${badge.bg} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
