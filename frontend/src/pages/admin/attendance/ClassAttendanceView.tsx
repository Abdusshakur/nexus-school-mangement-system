import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Bell,
  ArrowLeft,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useTeacherStore } from "../../../store/teacher.store";

// --- Student Mock Generation (same as provided) ---
const MALE_FIRST = [
  "Emeka",
  "Chidi",
  "Kolade",
  "Femi",
  "Tunde",
  "Yemi",
  "Ahmed",
  "Musa",
  "Uche",
  "Adewale",
  "Kola",
  "Dele",
  "Ibrahim",
  "Rasheed",
  "Babatunde",
  "Gbenga",
  "Seun",
  "Kunle",
];
const FEMALE_FIRST = [
  "Ngozi",
  "Chioma",
  "Amaka",
  "Funke",
  "Temi",
  "Bimpe",
  "Sade",
  "Aisha",
  "Fatima",
  "Adaeze",
  "Nneka",
  "Blessing",
  "Toyin",
  "Amina",
  "Halima",
  "Yetunde",
  "Bukola",
  "Chiamaka",
];
const LAST_NAMES = [
  "Okafor",
  "Adeyemi",
  "Nwosu",
  "Ibrahim",
  "Bello",
  "Eze",
  "Obi",
  "Aliyu",
  "Musa",
  "Adebayo",
  "Okonkwo",
  "Hassan",
  "Mohammed",
  "Abubakar",
  "Adeleke",
  "Oyelaran",
  "Adeola",
  "Babatunde",
  "Nwofor",
  "Olawale",
];
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-600",
  "bg-sky-500",
  "bg-teal-500",
  "bg-orange-500",
];

function seedRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(48271, s) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

interface ClassStudent {
  id: string;
  name: string;
  admNo: string;
  initials: string;
  color: string;
  parentName: string;
  parentPhone: string;
}

function generateStudents(classId: string, count = 28): ClassStudent[] {
  const seed = classId.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 7);
  const rng = seedRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const isFemale = rng() > 0.5;
    const first = isFemale
      ? FEMALE_FIRST[Math.floor(rng() * FEMALE_FIRST.length)]
      : MALE_FIRST[Math.floor(rng() * MALE_FIRST.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    return {
      id: `${classId}-${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      admNo: `WW/${classId}/${String(i + 1).padStart(3, "0")}`,
      initials: `${first[0]}${last[0]}`,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
      parentName: `${isFemale ? "Mrs." : "Mr."} ${last}`,
      parentPhone: `+234 803 ${String(Math.floor(rng() * 900 + 100))} ${String(Math.floor(rng() * 9000 + 1000))}`,
    };
  });
}

type AttStatus = "P" | "A";
interface TodayRecord {
  studentId: string;
  studentName: string;
  status: AttStatus;
  time: string;
}

const SUBMITTED_CLASSES = new Set([
  "SS2SCI",
  "JSS1A",
  "JSS1B",
  "JSS2A",
  "JSS2B",
  "JSS3A",
  "JSS3B",
  "SS1SCI",
  "SS1ARTS",
  "SS1COM",
  "SS2ARTS",
  "SS3SCI",
]);
const SUBMISSION_TIMES: Record<string, string> = {
  SS2SCI: "7:52 AM",
  JSS1A: "7:48 AM",
  JSS1B: "7:55 AM",
  JSS2A: "8:02 AM",
  JSS2B: "8:07 AM",
  JSS3A: "7:59 AM",
  JSS3B: "8:12 AM",
  SS1SCI: "8:05 AM",
  SS1ARTS: "8:08 AM",
  SS1COM: "8:15 AM",
  SS2ARTS: "8:19 AM",
  SS3SCI: "7:51 AM",
};

function getTodayRecords(classId: string): TodayRecord[] {
  const students = generateStudents(classId);
  const rng = seedRng(classId.length * 999);
  return students.map((s) => ({
    studentId: s.id,
    studentName: s.name,
    status: rng() > 0.12 ? "P" : "A",
    time: SUBMISSION_TIMES[classId] ?? "8:00 AM",
  }));
}

function classStats(classId: string) {
  const recs = SUBMITTED_CLASSES.has(classId) ? getTodayRecords(classId) : [];
  const total = generateStudents(classId).length;
  const present = recs.filter((r) => r.status === "P").length;
  const absent = recs.filter((r) => r.status === "A").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;
  return {
    total,
    present,
    absent,
    rate,
    submitted: SUBMITTED_CLASSES.has(classId),
  };
}

function rateBadge(rate: number) {
  if (rate >= 90) return "bg-emerald-100 text-emerald-800";
  if (rate >= 80) return "bg-indigo-100 text-indigo-800";
  if (rate >= 70) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`bg-white rounded-2xl w-full overflow-y-auto shadow-2xl ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh]`}
      >
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10 border-b border-slate-100">
          <h2 className="font-bold text-[17px] text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface NotifRecord {
  id: string;
  studentName: string;
  parentName: string;
  class: string;
  sentAt: string;
  status: "sent";
}

export function ClassAttendanceView() {
  const { classes, classTeacherAssignments } = useClassStore();
  const { teachers } = useTeacherStore();

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedAbsent, setSelectedAbsent] = useState<Set<string>>(new Set());
  const [notifModal, setNotifModal] = useState(false);
  const [reason, setReason] = useState("Absent without prior notice");
  const [notifHistory, setNotifHistory] = useState<NotifRecord[]>([]);
  const [notifSent, setNotifSent] = useState(false);
  const [tab, setTab] = useState<"classes" | "history">("classes");

  const getTeacherName = (classId: string) => {
    const tid = classTeacherAssignments[classId];
    return tid
      ? (teachers.find((t) => t.id === tid)?.name ?? "Unknown")
      : "Unassigned";
  };

  const selectedCls = selectedClass
    ? classes.find((c) => c.id === selectedClass)
    : null;
  const selectedStudents = selectedClass ? generateStudents(selectedClass) : [];
  const todayRecs = selectedClass
    ? SUBMITTED_CLASSES.has(selectedClass)
      ? getTodayRecords(selectedClass)
      : []
    : [];

  const toggleAbsent = (id: string) => {
    setSelectedAbsent((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendNotifications = () => {
    const now = new Date().toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newRecs: NotifRecord[] = [...selectedAbsent].map((studentId) => {
      const student = selectedStudents.find((s) => s.id === studentId)!;
      return {
        id: `N${Date.now()}-${studentId}`,
        studentName: student.name,
        parentName: student.parentName,
        class: selectedCls?.name ?? "",
        sentAt: now,
        status: "sent",
      };
    });
    setNotifHistory((prev) => [...newRecs, ...prev]);
    setNotifSent(true);
    setNotifModal(false);
    setSelectedAbsent(new Set());
    setTimeout(() => setNotifSent(false), 3000);
  };

  const absentStudents = todayRecs
    .filter((r) => r.status === "A")
    .map((r) => selectedStudents.find((s) => s.id === r.studentId)!)
    .filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">
            Class Attendance
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            Monitor today's attendance per class
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        {[
          { key: "classes", label: "All Classes" },
          {
            key: "history",
            label: `Notification History (${notifHistory.length})`,
          },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key as "classes" | "history");
              setSelectedClass(null);
            }}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${tab === t.key ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notifSent && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-100 border border-emerald-300">
          <CheckCircle size={18} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-800">
            Notifications sent to selected parents.
          </p>
        </div>
      )}

      {tab === "history" && (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          {notifHistory.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">
              No notifications sent yet.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  {["Student", "Parent", "Class", "Time Sent", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {notifHistory.map((n) => (
                  <tr key={n.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-sm font-medium text-slate-900">
                      {n.studentName}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {n.parentName}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {n.class}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-500">
                      {n.sentAt}
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        Sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "classes" && !selectedClass && (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "Class",
                  "Class Teacher",
                  "Total",
                  "Present",
                  "Absent",
                  "Rate",
                  "Submitted",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const s = classStats(cls.id);
                const rb = rateBadge(s.rate);
                return (
                  <tr
                    key={cls.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                      {cls.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {getTeacherName(cls.id)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">
                      {s.total}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-emerald-500">
                      {s.submitted ? s.present : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-red-500">
                      {s.submitted ? s.absent : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {s.submitted ? (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rb}`}
                        >
                          {s.rate}%
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.submitted ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                          <CheckCircle size={12} />{" "}
                          {SUBMISSION_TIMES[cls.id] ?? "—"}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {s.submitted && (
                        <button
                          onClick={() => setSelectedClass(cls.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors"
                        >
                          View Attendance
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "classes" && selectedClass && selectedCls && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedClass(null);
                setSelectedAbsent(new Set());
              }}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-slate-900">
                {selectedCls.name} — Attendance Sheet
              </h2>
              <p className="text-sm text-slate-500">
                Class Teacher: {getTeacherName(selectedClass)} · Submitted{" "}
                {SUBMISSION_TIMES[selectedClass]}
              </p>
            </div>
            {selectedAbsent.size > 0 && (
              <button
                onClick={() => setNotifModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-colors"
              >
                <Bell size={15} /> Notify {selectedAbsent.size} Parent
                {selectedAbsent.size !== 1 ? "s" : ""}
              </button>
            )}
          </div>

          {absentStudents.length > 0 && selectedAbsent.size === 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50">
              <AlertTriangle size={14} className="text-amber-800" />
              <p className="text-sm text-amber-800">
                {absentStudents.length} absent student
                {absentStudents.length !== 1 ? "s" : ""}. Select to notify
                parents.
              </p>
            </div>
          )}

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="w-10 px-4 py-3" />
                  {["Adm. Number", "Student Name", "Status", "Time"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {selectedStudents.map((student) => {
                  const rec = todayRecs.find((r) => r.studentId === student.id);
                  const isAbsent = rec?.status === "A";
                  const checked = selectedAbsent.has(student.id);
                  return (
                    <tr
                      key={student.id}
                      className={`border-t border-slate-100 ${checked ? "bg-amber-50/50" : "hover:bg-slate-50 transition-colors"}`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        {isAbsent && (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAbsent(student.id)}
                            className="w-4 h-4 rounded accent-amber-500"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                        {student.admNo}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${student.color}`}
                          >
                            <span className="text-white font-semibold text-[10px]">
                              {student.initials}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {student.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isAbsent ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"}`}
                        >
                          {isAbsent ? "Absent" : "Present"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm text-slate-400">
                        {rec?.time ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notify parent modal */}
      {notifModal && selectedCls && (
        <Modal title="Notify Parents" onClose={() => setNotifModal(false)} wide>
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Sending absence notification to {selectedAbsent.size} parent
              {selectedAbsent.size !== 1 ? "s" : ""} for {selectedCls.name}.
            </p>
            <div className="rounded-xl p-3 space-y-2 bg-slate-50 border border-slate-100">
              {[...selectedAbsent].map((sid) => {
                const s = selectedStudents.find((x) => x.id === sid);
                if (!s) return null;
                return (
                  <div key={sid} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${s.color}`}
                    >
                      <span className="text-white font-semibold text-[10px]">
                        {s.initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Parent: {s.parentName} · {s.parentPhone}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                {[
                  "Absent without prior notice",
                  "Unexplained absence",
                  "Late arrival",
                  "Please contact school",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">
                Message Preview
              </label>
              <div className="p-3 rounded-lg text-sm bg-teal-50 border border-teal-100 text-teal-900">
                Dear Parent, your ward was marked <strong>absent</strong> from{" "}
                {selectedCls.name} today (
                {new Date().toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                ). Reason: {reason}. Please contact Westwood Academy for more
                information. Thank you.
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSendNotifications}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
              >
                <Send size={14} /> Send Notifications
              </button>
              <button
                onClick={() => setNotifModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
