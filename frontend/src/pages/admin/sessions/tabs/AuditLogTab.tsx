import { ClipboardList } from "lucide-react";

const AUDIT_LOG = [
  {
    action: "Third Term Opened",
    desc: "Third Term opened",
    by: "Sarah Admin",
    date: "27 Apr 2026, 08:00",
  },
  {
    action: "Second Term Closed",
    desc: "Second Term closed",
    by: "Sarah Admin",
    date: "04 Apr 2026, 15:00",
  },
  {
    action: "Second Term Opened",
    desc: "Second Term opened",
    by: "Sarah Admin",
    date: "12 Jan 2026, 08:00",
  },
  {
    action: "First Term Closed",
    desc: "First Term closed",
    by: "Sarah Admin",
    date: "13 Dec 2025, 15:00",
  },
  {
    action: "First Term Opened",
    desc: "First Term opened",
    by: "Sarah Admin",
    date: "08 Sept 2025, 08:00",
  },
  {
    action: "Session Created",
    desc: "Session created",
    by: "Sarah Admin",
    date: "01 Aug 2025, 09:00",
  },
];

export function AuditLogTab() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          Audit Log ({AUDIT_LOG.length} entries)
        </h3>
      </div>
      <div className="divide-y divide-slate-100">
        {AUDIT_LOG.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-50">
              <ClipboardList size={14} className="text-indigo-500" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-slate-900">
                {entry.action}
              </p>
              <p className="text-xs mt-0.5 text-slate-500">{entry.desc}</p>
              <p className="text-xs mt-0.5 text-slate-400 font-medium">
                by {entry.by}
              </p>
            </div>
            <p className="text-xs shrink-0 text-slate-400 font-medium">
              {entry.date}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
