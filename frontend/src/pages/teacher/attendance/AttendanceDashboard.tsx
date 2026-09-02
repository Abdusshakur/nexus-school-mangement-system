import { useState } from "react";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useTeacherAttendanceStore } from "../../../store/teacherAttendance.store";
import { type RollStudent, AVATAR_COLORS } from "./teacherData";

import { useAuthStore } from "../../../store/auth/authStore";
import { useTeacherStore } from "../../../store/teacher.store";
import { useEffect } from "react";


type MarkStatus = "P" | "A" | "L" | "";

function NotClassTeacher() {
  const navigate = useNavigate();
  return (
    <div className="max-w-lg mx-auto mt-12">
      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-amber-100">
          <AlertTriangle size={24} className="text-amber-500" />
        </div>
        <h2 className="font-bold mb-2 text-xl text-slate-900">
          Attendance Not Available
        </h2>
        <p className="text-sm leading-relaxed mb-6 text-slate-500">
          Attendance marking is only available to teachers who have been
          assigned as a Class Teacher by the school administrator. You are not
          currently assigned as a class teacher for any class.
        </p>
        <p className="text-sm mb-6 text-slate-400">
          Please contact the school administrator to be assigned to a class.
        </p>
        <button
          onClick={() => navigate("/teacher")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white mx-auto bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeft size={15} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}

const TODAY = new Date().toLocaleDateString("en-NG", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const TODAY_ISO = new Date().toISOString().slice(0, 10);

export default function TeacherAttendance() {
  const {
    submitAttendance,
    attendanceSubmissions,
    teacherClasses,
    fetchMyClasses,
    classRosterData,
    fetchClassRoster,
    loading
  } = useTeacherAttendanceStore();

  const { user } = useAuthStore();
  const { fetchTeachers } = useTeacherStore();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeachers().catch(() => { });
    fetchMyClasses().catch(() => { });
  }, [fetchTeachers, fetchMyClasses]);

  useEffect(() => {
    if (teacherClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [teacherClasses, selectedClassId]);

  const cls = teacherClasses.find(c => c.id === selectedClassId) || null;
  const myClassId = cls?.id;



  const [students, setStudents] = useState<RollStudent[]>([]);

  useEffect(() => {
    if (myClassId) {
      fetchClassRoster(myClassId, TODAY_ISO);
    }
  }, [myClassId, fetchClassRoster]);

  useEffect(() => {
    if (classRosterData?.students) {
      const mapped = classRosterData.students.map((d: any, i: number) => ({
        id: d.student_id || d.id,
        name: `${d.first_name} ${d.last_name}`,
        admNo: d.admission_number,
        initials: `${d.first_name?.[0] || ""}${d.last_name?.[0] || ""}`,
        color: AVATAR_COLORS[i % AVATAR_COLORS.length]
      }));
      setStudents(mapped);
      
      const newMarks: Record<string, MarkStatus> = {};
      classRosterData.students.forEach((d: any) => {
        if (d.status === "PRESENT") newMarks[d.student_id || d.id] = "P";
        else if (d.status === "ABSENT") newMarks[d.student_id || d.id] = "A";
        else if (d.status === "LATE") newMarks[d.student_id || d.id] = "L";
      });
      setMarks(newMarks);
    }
  }, [classRosterData]);

  const [marks, setMarks] = useState<Record<string, MarkStatus>>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  
  // Use backend status if available, otherwise check local optimistic updates
  const backendSubmitted = classRosterData?.attendance_status && classRosterData.attendance_status !== "PENDING";
  
  const alreadySubmitted = backendSubmitted || attendanceSubmissions.find(
    (s) =>
      s.teacherId === user?.id &&
      s.date === TODAY_ISO &&
      s.classId === myClassId,
  );

  const setMark = (id: string, status: MarkStatus) => {
    setMarks((prev) => ({ ...prev, [id]: prev[id] === status ? "" : status }));
  };

  const markAll = (status: "P" | "A") => {
    const next: Record<string, MarkStatus> = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setMarks(next);
  };

  const counts = {
    present: students.filter((s) => marks[s.id] === "P").length,
    absent: students.filter((s) => marks[s.id] === "A").length,
    remaining: students.filter((s) => !marks[s.id]).length,
  };
  const completion =
    students.length > 0
      ? Math.round(
        ((students.length - counts.remaining) / students.length) * 100,
      )
      : 0;
  const allMarked = counts.remaining === 0 && students.length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    const time = new Date().toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      await submitAttendance({
        teacherId: user?.id || "",
        teacherName: user
          ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
          : "",
        classId: myClassId!,
        className: cls!.name,
        subject: "Mark Attendance",
        date: TODAY_ISO,
        entries: students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          status: marks[s.id] as "P" | "A" | "L",
        })),
      });
      setSubmitting(false);
      setSubmitted(true);
      setIsEditing(false);
      toast.success("Attendance Submitted Successfully", {
        description: "Pending admin approval",
      });
      setSubmissionTime(time);
    } catch (error: unknown) {
      setSubmitting(false);
      toast.error("Failed to submit attendance", {
        description: (error as Error).message || "Please try again later.",
      });
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-full bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading classes...</p>
      </div>
    </div>
  );

  if (!myClassId || !cls) return <NotClassTeacher />;

  if ((submitted || alreadySubmitted) && !isEditing) {
    const subData = typeof alreadySubmitted === "object" ? alreadySubmitted : null;
    const presentCount = subData
      ? subData.entries.filter((e: any) => e.status === "P").length
      : counts.present;
    const absentCount = subData
      ? subData.entries.filter((e: any) => e.status === "A").length
      : counts.absent;
    const displayTime =
      submissionTime ||
      (subData
        ? new Date(subData.submittedAt).toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "");

    const classSelector = (
      <select
        className="ml-3 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700"
        value={selectedClassId || ""}
        onChange={(e) => setSelectedClassId(e.target.value)}
        disabled={teacherClasses.length <= 1}
      >
        {teacherClasses.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    );

    return (
      <div className="flex-1 flex bg-slate-50 min-h-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-8 w-full space-y-5">
          <header className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-slate-900 text-lg sm:text-2xl font-extrabold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
                Attendance Register {classSelector}
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                {TODAY}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:justify-end">
              {classRosterData?.attendance_status !== "APPROVED" && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 sm:px-3 py-1.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
              )}
              <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                classRosterData?.attendance_status === "APPROVED" ? "bg-indigo-100 text-indigo-800" :
                classRosterData?.attendance_status === "REJECTED" ? "bg-red-100 text-red-800" :
                "bg-emerald-100 text-emerald-800"
              }`}>
                {classRosterData?.attendance_status || "SUBMITTED"}
              </span>
            </div>
          </header>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
              <p className="font-bold text-3xl text-emerald-500">
                {presentCount}
              </p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
              <p className="font-bold text-3xl text-red-500">{absentCount}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center border border-slate-200">
              <p className="font-bold text-3xl text-indigo-500">
                {students.length}
              </p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Submitted Attendance : {displayTime}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {students.map((student) => {
                const studentEntry = subData?.entries.find(
                  (e: any) => e.studentId === student.id,
                );
                const status = studentEntry?.status ?? marks[student.id];
                const isPresent = status === "P";
                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${student.color}`}
                    >
                      <span className="text-white font-semibold text-[11px]">
                        {student.initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {student.name}
                      </p>
                      <p className="text-xs font-mono text-slate-400">
                        {student.admNo}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPresent ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                    >
                      {isPresent ? "Present" : "Absent"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const classSelector = (
    <select
      className="ml-3 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700"
      value={selectedClassId || ""}
      onChange={(e) => setSelectedClassId(e.target.value)}
      disabled={teacherClasses.length <= 1}
    >
      {teacherClasses.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-lg sm:text-2xl font-extrabold tracking-tight flex flex-col sm:flex-row sm:items-center gap-2">
            Mark Attendance {classSelector}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{TODAY}</p>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 w-full space-y-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-lg text-slate-900">{cls.name}</p>
              <p className="text-sm text-slate-500">
                {students.length} students enrolled
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-xl sm:text-2xl text-teal-600">{completion}%</p>
              <p className="text-[10px] sm:text-xs text-slate-500">complete</p>
            </div>
          </div>

          <div className="rounded-full h-2.5 mb-4 overflow-hidden bg-slate-100">
            <div
              className="h-full rounded-full transition-all bg-teal-600"
              style={{ width: `${completion}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Present",
                value: counts.present,
                color: "text-emerald-500",
                bg: "bg-emerald-100",
              },
              {
                label: "Absent",
                value: counts.absent,
                color: "text-red-500",
                bg: "bg-red-100",
              },
              {
                label: "Remaining",
                value: counts.remaining,
                color: "text-amber-500",
                bg: "bg-amber-100",
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`text-center p-2 sm:p-3 rounded-xl ${bg}`}>
                <p className={`font-bold text-xl sm:text-2xl ${color}`}>{value}</p>
                <p className={`text-[10px] sm:text-xs font-medium opacity-80 ${color} truncate`}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap">
            <span className="text-xs sm:text-sm font-medium text-slate-500 shrink-0">
              Mark all as:
            </span>
            <button
              onClick={() => markAll("P")}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
            >
              All Present
            </button>
            <button
              onClick={() => markAll("A")}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
            >
              All Absent
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student Register
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {students.map((student) => {
              const status = marks[student.id];
              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 px-5 py-3 transition-colors ${status === "P" ? "bg-green-50" : status === "A" ? "bg-red-50" : "bg-transparent"}`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${student.color}`}
                  >
                    <span className="text-white font-semibold text-[11px]">
                      {student.initials}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      {student.name}
                    </p>
                    <p className="text-xs font-mono text-slate-400">
                      {student.admNo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMark(student.id, "P")}
                      className={`w-16 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${status === "P" ? "bg-emerald-500 border-emerald-500 text-white" : "bg-transparent border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500"}`}
                    >
                      P
                    </button>
                    <button
                      onClick={() => setMark(student.id, "A")}
                      className={`w-16 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${status === "A" ? "bg-red-500 border-red-500 text-white" : "bg-transparent border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-500"}`}
                    >
                      A
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          {!allMarked && counts.remaining > 0 && (
            <div className="flex items-center gap-2 mb-3 p-3 rounded-lg bg-amber-100">
              <AlertTriangle size={14} className="text-amber-800 shrink-0" />
              <p className="text-sm text-amber-800">
                {counts.remaining} student{counts.remaining !== 1 ? "s" : ""}{" "}
                not yet marked. Mark all students before submitting.
              </p>
            </div>
          )}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!allMarked}
            className={`w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all ${allMarked ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-teal-600/20" : "bg-slate-300 cursor-not-allowed"}`}
          >
            Submit Attendance
          </button>
          <p className="text-xs text-center mt-2 text-slate-400">
            All {students.length} students must be marked before you can submit.
          </p>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-teal-50">
                <CheckCircle size={22} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-center mb-2 text-[17px] text-slate-900">
                Submit Attendance?
              </h3>
              <p className="text-sm text-center mb-1 text-slate-500">
                {cls.name} · {TODAY}
              </p>
              <div className="flex gap-6 justify-center my-4 text-sm font-medium">
                <span className="text-emerald-500">
                  ✓ {counts.present} Present
                </span>
                <span className="text-red-500">✗ {counts.absent} Absent</span>
              </div>
              <p className="text-xs text-center mb-5 text-slate-400">
                Once submitted, attendance cannot be edited. It will be sent to
                the admin for approval.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
