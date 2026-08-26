import { useState, useEffect } from "react";
import {
  Plus,
  CheckCircle,
  ChevronRight,
  Eye,
  Lock,
  Users,
} from "lucide-react";
import { useSessionStore } from "../../../store/session.store";
import { StartSessionModal } from "./StartSessionModal";
import { AccessRequestsPanel } from "./AccessRequestsPanel";
import { SessionDetailView } from "./SessionDetailView";
import { StatusBadge } from "./components/StatusBadge";
import { ActionMenu } from "./components/ActionMenu";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function AcademicSessionsPage() {
  const { academicSessions, fetchSessions, startNewSession } = useSessionStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const active = academicSessions.find((s) => s.status === "active");
  const archived = academicSessions.filter((s) => s.status === "archived");

  if (detailSessionId) {
    return (
      <SessionDetailView
        sessionId={detailSessionId}
        onBack={() => setDetailSessionId(null)}
      />
    );
  }

  const handleStartSession = (data: {
    name: string;
    startDate: string;
    endDate: string;
    term: string;
  }) => {
    startNewSession(data);
    setShowModal(false);
    setSuccessMsg(
      `Academic Session ${data.name} started successfully. Previous session is now locked.`,
    );
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">
            Academic Sessions
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            Manage and archive academic sessions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={15} /> Start New Session
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <CheckCircle size={18} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
        </div>
      )}

      {/* Active session */}
      {active && (
        <div className="rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md">
          <div className="px-6 py-5 bg-linear-to-br from-emerald-100 to-emerald-50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500 shadow-sm shrink-0">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xl text-emerald-900">
                      {active.name}
                    </p>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm tracking-wide">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-sm font-medium text-emerald-700">
                    {active.term}
                  </p>
                </div>
              </div>
              <div className="md:text-right flex gap-6 md:block">
                <p className="text-xs font-semibold text-emerald-800">
                  Start:{" "}
                  <span className="font-medium text-emerald-700">
                    {fmtDate(active.startDate)}
                  </span>
                </p>
                <p className="text-xs font-semibold text-emerald-800 mt-1 md:mt-0.5">
                  End:{" "}
                  <span className="font-medium text-emerald-700">
                    {fmtDate(active.endDate)}
                  </span>
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {[
                { label: "Total Students", value: "568" },
                { label: "Total Classes", value: "18" },
                { label: "Active Teachers", value: "5" },
                { label: "Subjects", value: "26" },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="bg-white/70 rounded-xl p-4 text-center border border-white/50 shadow-sm"
                >
                  <p className="font-bold text-2xl text-emerald-900">{value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700/80 mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setDetailSessionId(active.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
              >
                <Eye size={14} /> Manage Session <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archived sessions accordion */}
      {archived.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-[15px] text-slate-700">
            Archived Sessions ({archived.length})
          </h2>
          <div className="space-y-3">
            {archived.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() =>
                    setExpandedSession(
                      expandedSession === session.id ? null : session.id,
                    )
                  }
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-slate-100">
                    <Lock size={18} className="text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{session.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 tracking-wide">
                        ARCHIVED
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 text-slate-400 font-medium">
                      {fmtDate(session.startDate)} — {fmtDate(session.endDate)}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                    {expandedSession === session.id
                      ? "Collapse"
                      : "View Details"}
                    <ChevronRight
                      size={12}
                      className={`transition-transform duration-200 ${
                        expandedSession === session.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>
                </div>

                {expandedSession === session.id && (
                  <div className="px-5 pb-4 border-t border-slate-50">
                    <div className="pt-4 space-y-3">
                      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <Lock
                          size={14}
                          className="text-slate-400 mt-0.5 shrink-0"
                        />
                        <p className="text-sm text-slate-500 leading-relaxed">
                          This session is archived. All records are preserved as
                          read-only historical data. Teachers require
                          administrator approval to access archived sessions.
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {["Students", "Classes", "Subjects"].map((l) => (
                          <div
                            key={l}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-center"
                          >
                            <p className="font-bold text-lg text-slate-700">
                              —
                            </p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                              {l}
                            </p>
                          </div>
                        ))}
                        <div className="p-3 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => setDetailSessionId(session.id)}
                            className="w-full h-full text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                          >
                            Full Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sessions table (All Sessions view) */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm mt-8">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">
            All Sessions Directory
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "SESSION NAME",
                  "ACADEMIC YEAR",
                  "START DATE",
                  "END DATE",
                  "STATUS",
                  "STUDENTS",
                  "CLASSES",
                  "ACTIONS",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {academicSessions.map((session) => {
                const isActive = session.status === "active";
                return (
                  <tr
                    key={session.id}
                    className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {session.name} Academic Session
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-600">
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {session.name}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {fmtDate(session.startDate)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {fmtDate(session.endDate)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={session.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-1.5 text-sm text-slate-700 font-medium">
                        <Users size={14} className="text-slate-400" />
                        {isActive
                          ? "250"
                          : session.status === "locked"
                            ? "238"
                            : "221"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                      18
                    </td>
                    <td className="px-5 py-4">
                      <ActionMenu
                        onViewDetails={() => setDetailSessionId(session.id)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Requests */}
      <AccessRequestsPanel />

      {showModal && (
        <StartSessionModal
          activeSession={active}
          onClose={() => setShowModal(false)}
          onConfirm={handleStartSession}
        />
      )}
    </div>
  );
}
