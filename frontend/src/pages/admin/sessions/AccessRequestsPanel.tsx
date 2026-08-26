import { useEffect } from "react";
import { UserCheck, XCircle } from "lucide-react";
import { useSessionStore } from "../../../store/session.store";
import { useTeacherStore } from "../../../store/teacher.store";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} day${
    Math.floor(hrs / 24) !== 1 ? "s" : ""
  } ago`;
}

export function AccessRequestsPanel() {
  const { sessionAccessRequests, approveAccessRequest, rejectAccessRequest } =
    useSessionStore();
  const { teachers, fetchTeachers } = useTeacherStore();

  useEffect(() => {
    fetchTeachers().catch(() => {});
  }, [fetchTeachers]);

  const pending = sessionAccessRequests.filter((r) => r.status === "pending");
  const reviewed = sessionAccessRequests.filter((r) => r.status !== "pending");

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">
            Archived Session Access Requests
          </h3>
          {pending.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              {pending.length} pending
            </span>
          )}
        </div>
      </div>

      {sessionAccessRequests.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">
          No access requests yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {[...pending, ...reviewed].map((req) => {
            const teacher = teachers.find((t) => t.id === req.teacherId);
            return (
              <div key={req.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      teacher?.avatarColor ?? "bg-indigo-500"
                    }`}
                  >
                    <span className="text-white font-bold text-[11px]">
                      {teacher?.avatar ?? "??"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-slate-900">
                        {req.teacherName}
                      </p>
                      <span className="text-xs text-slate-400">
                        {teacher?.dept}
                      </span>
                      {req.status === "pending" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                      {req.status === "approved" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Approved · 24 hr access
                        </span>
                      )}
                      {req.status === "rejected" && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                          Rejected
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 text-slate-500">
                      Requested Session: <strong>{req.sessionName}</strong>
                    </p>
                    <p className="text-xs mt-1 p-2 rounded-lg text-slate-700 bg-slate-50 border border-slate-100">
                      "{req.reason}"
                    </p>
                    <p className="text-xs mt-1.5 text-slate-400">
                      Requested {timeAgo(req.requestedAt)}
                    </p>
                    {req.status === "pending" && (
                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => approveAccessRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
                        >
                          <UserCheck size={12} /> Approve
                        </button>
                        <button
                          onClick={() => rejectAccessRequest(req.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          <XCircle size={12} /> Reject
                        </button>
                      </div>
                    )}
                    {req.status === "approved" && req.approvedAt && (
                      <p className="text-xs mt-1.5 font-medium text-emerald-500">
                        ✓ Access granted · Expires 24 hours from{" "}
                        {formatDate(req.approvedAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
