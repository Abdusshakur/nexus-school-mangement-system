function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const TERMS_DATA = [
  {
    label: "First Term",
    status: "closed",
    start: "2025-09-08",
    end: "2025-12-13",
  },
  {
    label: "Second Term",
    status: "closed",
    start: "2026-01-12",
    end: "2026-04-04",
  },
  {
    label: "Third Term",
    status: "active",
    start: "2026-04-27",
    end: "2026-07-25",
  },
];

interface TermsTabProps {
  isActive: boolean;
}

export function TermsTab({ isActive }: TermsTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {TERMS_DATA.map((term) => {
        const isTermActive = term.status === "active";
        return (
          <div
            key={term.label}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">{term.label}</h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${isTermActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
              >
                {isTermActive ? "Active" : "Closed"}
              </span>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-500">Start</span>
                <span className="text-slate-900 font-medium">
                  {fmtDate(term.start)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-500">End</span>
                <span className="text-slate-900 font-medium">
                  {fmtDate(term.end)}
                </span>
              </div>
            </div>
            {isTermActive && isActive && (
              <button className="w-full py-2 rounded-lg text-sm font-semibold mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer">
                Close Term
              </button>
            )}
            {isActive && (
              <button className="w-full py-2 rounded-lg text-sm border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer">
                Edit Dates
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
