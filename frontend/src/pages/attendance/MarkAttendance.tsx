import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { studentsList, type AttendanceStatus } from "./data";

export function MarkAttendance() {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saved, setSaved] = useState(false);

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((a) => ({ ...a, [id]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    studentsList.forEach((s) => {
      next[s.id] = status;
    });
    setAttendance(next);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      navigate("/attendance");
    }, 1500);
  };

  const counts = {
    present: Object.values(attendance).filter((v) => v === "Present").length,
    absent: Object.values(attendance).filter((v) => v === "Absent").length,
    late: Object.values(attendance).filter((v) => v === "Late").length,
  };

  const StatusBtn = ({
    label,
    value,
    color,
    studentId,
  }: {
    label: string;
    value: AttendanceStatus;
    color: string;
    studentId: string;
  }) => {
    const active = attendance[studentId] === value;
    return (
      <button
        onClick={() => setStatus(studentId, active ? "" : value)}
        className="px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none"
        style={
          active
            ? { background: color, color: "#fff", borderColor: color }
            : {
                background: "transparent",
                color: "#64748B",
                borderColor: "#E2E8F0",
              }
        }
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 flex items-center gap-4">
        <Link
          to="/attendance"
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Mark Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Monday, June 15, 2026 · Roll Call
          </p>
        </div>
      </header>

      <main className="flex-1 p-8 space-y-6 max-w-3xl w-full mx-auto">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Present Today",
              value: counts.present,
              color: "#10B981",
              bg: "#D1FAE5",
            },
            {
              label: "Absent Today",
              value: counts.absent,
              color: "#EF4444",
              bg: "#FEE2E2",
            },
            {
              label: "Late Today",
              value: counts.late,
              color: "#F59E0B",
              bg: "#FEF3C7",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm"
            >
              <p className="font-extrabold text-3xl" style={{ color: s.color }}>
                {s.value}
              </p>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Bulk actions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center gap-3 shadow-sm">
          <span className="text-sm text-slate-500 font-bold">Mark all as:</span>
          <button
            onClick={() => markAll("Present")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-150 transition-colors cursor-pointer"
          >
            Present
          </button>
          <button
            onClick={() => markAll("Absent")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-100 text-red-800 hover:bg-red-150 transition-colors cursor-pointer"
          >
            Absent
          </button>
          <button
            onClick={() => markAll("Late")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 hover:bg-amber-150 transition-colors cursor-pointer"
          >
            Late
          </button>
        </div>

        {/* Student list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {studentsList.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                attendance[s.id] === "Present"
                  ? "bg-emerald-50/20"
                  : attendance[s.id] === "Absent"
                    ? "bg-red-50/20"
                    : attendance[s.id] === "Late"
                      ? "bg-amber-50/20"
                      : ""
              }`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: s.avatarColor }}
              >
                <span className="text-white font-bold text-xs">{s.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{s.name}</p>
                <p className="text-xs font-medium text-slate-400">
                  {s.id} · {s.grade}
                </p>
              </div>
              <div className="flex gap-2">
                <StatusBtn
                  label="Present"
                  value="Present"
                  color="#10B981"
                  studentId={s.id}
                />
                <StatusBtn
                  label="Late"
                  value="Late"
                  color="#F59E0B"
                  studentId={s.id}
                />
                <StatusBtn
                  label="Absent"
                  value="Absent"
                  color="#EF4444"
                  studentId={s.id}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <CheckCircle size={16} />
            {saved ? "Saving..." : "Save Attendance"}
          </button>
          <Link
            to="/attendance"
            className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
          >
            Cancel
          </Link>
        </div>
      </main>
    </div>
  );
}
