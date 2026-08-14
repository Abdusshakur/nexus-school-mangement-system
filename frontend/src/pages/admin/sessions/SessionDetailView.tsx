import { useState, useEffect } from "react";
import {
  Lock,
  ArrowLeft,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  FileText,
  BarChart2,
  ClipboardList,
} from "lucide-react";
import { useSessionStore } from "../../../store/session.store";
import { useClassStore } from "../../../store/class.store";
import { StatusBadge } from "./components/StatusBadge";
import { OverviewTab } from "./tabs/OverviewTab";
import { TermsTab } from "./tabs/TermsTab";
import { ClassesTab } from "./tabs/ClassesTab";
import { StudentsTab } from "./tabs/StudentsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { AuditLogTab } from "./tabs/AuditLogTab";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type DetailTab =
  | "overview"
  | "terms"
  | "classes"
  | "students"
  | "reports"
  | "analytics"
  | "audit";

export function SessionDetailView({
  sessionId,
  onBack,
}: {
  sessionId: string;
  onBack: () => void;
}) {
  const { academicSessions } = useSessionStore();
  const { classes, loadClasses } = useClassStore();
  const session = academicSessions.find((s) => s.id === sessionId);
  const [tab, setTab] = useState<DetailTab>("overview");

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  if (!session) return null;

  const TABS: { id: DetailTab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "terms", label: "Terms", icon: Calendar },
    { id: "classes", label: "Classes", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "audit", label: "Audit Log", icon: ClipboardList },
  ];

  const isActive = session.status === "active";

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-10">
      <div className="flex items-center gap-2 text-sm text-indigo-500">
        <button onClick={onBack} className="hover:underline cursor-pointer">
          Academic Sessions
        </button>
        <span className="text-slate-400">›</span>
        <span className="text-slate-700">{session.name} Academic Session</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} className="text-slate-700" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-bold text-[22px] text-slate-900">
                {session.name} Academic Session
              </h1>
              <StatusBadge status={session.status} />
            </div>
            <p className="text-sm mt-0.5 text-slate-500">
              {session.name} • {fmtDate(session.startDate)} –{" "}
              {fmtDate(session.endDate)}
            </p>
          </div>
        </div>
        {isActive && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition-colors cursor-pointer">
            <Lock size={14} /> Lock Session
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                  active
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab session={session} classesCount={classes.length} />
      )}
      {tab === "terms" && <TermsTab isActive={isActive} />}
      {tab === "classes" && <ClassesTab classes={classes} />}
      {tab === "students" && <StudentsTab />}
      {tab === "reports" && <ReportsTab />}
      {tab === "analytics" && <AnalyticsTab />}
      {tab === "audit" && <AuditLogTab />}
    </div>
  );
}
