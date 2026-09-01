import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Bell,
  ArrowLeft,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useAttendanceStore } from "../../../store/attendance.store";
import { toast } from "sonner";

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

function getAvatarColor(id: string) {
  if (!id) return AVATAR_COLORS[0];
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[seed % AVATAR_COLORS.length];
}

interface NotifRecord {
  id: string;
  studentName: string;
  parentName: string;
  class: string;
  sentAt: string;
  status: "sent";
}

function rateBadge(rate: number) {
  if (rate >= 90) return "bg-emerald-100 text-emerald-800";
  if (rate >= 80) return "bg-indigo-50 text-indigo-700";
  if (rate >= 70) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function ClassAttendanceView() {
  const {
    dailySummary,
    activeClassRoster,
    loading,
    fetchDailySummary,
    fetchClassRoster,
    approveSession,
    rejectSession,
    reopenSession,
    activeSessionId,
    activeSessionStatus,
    activeSessionSubmittedAt,
  } = useAttendanceStore();

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedAbsent, setSelectedAbsent] = useState<Set<string>>(new Set());
  const [notifModal, setNotifModal] = useState(false);
  const [reason, setReason] = useState("Absent without prior notice");
  const [notifHistory, setNotifHistory] = useState<NotifRecord[]>([]);
  const [notifSent, setNotifSent] = useState(false);
  const [tab, setTab] = useState<"classes" | "history">("classes");

  useEffect(() => {
    fetchDailySummary();
  }, [fetchDailySummary]);

  useEffect(() => {
    if (selectedClass) {
      const date = dailySummary?.date || new Date().toISOString().split("T")[0];
      fetchClassRoster(selectedClass, date);
    }
  }, [selectedClass, fetchClassRoster, dailySummary?.date]);

  const selectedCls = dailySummary?.classes?.find(
    (c) => c.class_id === selectedClass,
  );

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
      const student = activeClassRoster.find(
        (s) => (s.id || s.student_id) === studentId,
      )!;
      return {
        id: `N${Date.now()}-${studentId}`,
        studentName: `${student.first_name} ${student.last_name}`,
        parentName: "Parent", // TODO: Wire parent name if backend returns it
        class: selectedCls?.class_name ?? "",
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

  const handleApprove = async () => {
    if (!activeSessionId) return;
    try {
      await approveSession(activeSessionId, "Approved by admin");
      toast.success("Attendance approved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to approve attendance.");
    }
  };

  const handleReject = async () => {
    if (!activeSessionId) return;
    try {
      await rejectSession(activeSessionId, "Rejected by admin");
      toast.success("Attendance rejected!");
      setSelectedClass(null); // Optional: close view after rejection
    } catch (e: any) {
      toast.error(e.message || "Failed to reject attendance.");
    }
  };

  const handleReopen = async () => {
    if (!activeSessionId) return;
    try {
      await reopenSession(activeSessionId, "Reopened by admin");
      toast.success("Attendance reopened!");
    } catch (e: any) {
      toast.error(e.message || "Failed to reopen attendance.");
    }
  };

  const absentStudents = activeClassRoster.filter((r) => r.status === "ABSENT");

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
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === t.key ? "border-indigo-500 text-indigo-500" : "border-transparent text-slate-500 hover:text-slate-700"}`}
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
              {loading && !dailySummary ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                      <td className="px-4 py-4 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                    </tr>
                  ))}
                </>
              ) : !dailySummary?.classes ||
                dailySummary.classes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No classes found.
                  </td>
                </tr>
              ) : (
                dailySummary.classes.map((cls) => {
                  const submitted =
                    cls.session_status === "SUBMITTED" ||
                    cls.session_status === "APPROVED";
                  const rb = rateBadge(cls.attendance_rate_percentage);

                  return (
                    <tr
                      key={cls.class_id}
                      className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                        {cls.class_name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {cls.form_teacher_name || "Unassigned"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">
                        {cls.total_students}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-500">
                        {submitted ? cls.total_present : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-500">
                        {submitted ? cls.total_absent : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {submitted ? (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rb}`}
                          >
                            {cls.attendance_rate_percentage}%
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {submitted ? (
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${cls.session_status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-indigo-100 text-indigo-700"
                              }`}
                          >
                            {cls.session_status === "SUBMITTED"
                              ? "Submitted"
                              : cls.session_status}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-500">
                            <Clock size={12} /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {submitted && (
                          <button
                            onClick={() => setSelectedClass(cls.class_id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition-colors"
                          >
                            View Sheet
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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
                {selectedCls.class_name} Attendance Sheet
              </h2>
              <p className="text-sm text-slate-500">
                Class Teacher: {selectedCls.form_teacher_name || "Unassigned"} ·
                {activeSessionSubmittedAt && ` Submitted ${new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "numeric" }).format(new Date(activeSessionSubmittedAt))} · `}
                Status:{" "}
                {activeSessionStatus || selectedCls.session_status}
              </p>
            </div>

            <div className="flex gap-2">
              {activeSessionStatus === "SUBMITTED" && activeSessionId && (
                <>
                  <button
                    onClick={handleReject}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <X size={15} /> Reject
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                </>
              )}
              {(activeSessionStatus === "APPROVED" ||
                activeSessionStatus === "REJECTED") &&
                activeSessionId && (
                  <button
                    onClick={handleReopen}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <Clock size={15} /> Reopen
                  </button>
                )}
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
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-100">
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
                  {["Adm. Number", "Student Name", "Status", "Remarks"].map(
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
                {loading && activeClassRoster.length === 0 ? (
                  <>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="border-b border-slate-100 last:border-0">
                        <td className="px-4 py-3"><Skeleton className="h-10 w-10 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        {activeSessionStatus === "PENDING" && (
                          <td className="px-4 py-3 text-right"><Skeleton className="h-5 w-5 ml-auto" /></td>
                        )}
                      </tr>
                    ))}
                  </>
                ) : activeClassRoster.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-slate-400"
                    >
                      No students found.
                    </td>
                  </tr>
                ) : (
                  activeClassRoster.map((student) => {
                    const isAbsent = student.status === "ABSENT";
                    const studentId = student.id || student.student_id;
                    const checked = selectedAbsent.has(studentId);
                    const initials =
                      `${student.first_name?.[0] || ""}${student.last_name?.[0] || ""}`.toUpperCase();

                    return (
                      <tr
                        key={studentId}
                        className={`border-t border-slate-100 ${checked ? "bg-amber-50" : "hover:bg-slate-50 transition-colors"}`}
                      >
                        <td className="px-4 py-2.5 text-center">
                          {isAbsent && (
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAbsent(studentId)}
                              className="w-4 h-4 rounded accent-amber-500"
                            />
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-500">
                          {student.admission_number}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(studentId)}`}
                            >
                              <span className="text-white font-semibold text-[10px]">
                                {initials}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {student.first_name} {student.last_name}
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
                          {student.remarks || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
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
              {selectedAbsent.size !== 1 ? "s" : ""} for{" "}
              {selectedCls.class_name}.
            </p>
            <div className="rounded-xl p-3 space-y-2 bg-slate-50 border border-slate-100">
              {[...selectedAbsent].map((sid) => {
                const s = activeClassRoster.find(
                  (x) => (x.id || x.student_id) === sid,
                );
                if (!s) return null;
                const initials =
                  `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase();
                return (
                  <div key={sid} className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${getAvatarColor(sid)}`}
                    >
                      <span className="text-white font-semibold text-[10px]">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {s.first_name} {s.last_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Parent: Unknown · +234 803 *** ****
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
                {selectedCls.class_name} today (
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
