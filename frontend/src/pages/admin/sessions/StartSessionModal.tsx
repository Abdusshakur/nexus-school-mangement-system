import { useState } from "react";
import { CheckCircle, AlertTriangle, Plus, X } from "lucide-react";

const CHECKLIST = [
  { key: "attendance", label: "All attendance records submitted", done: true },
  { key: "results", label: "All results approved", done: true },
  { key: "reports", label: "Report cards generated", done: true },
  {
    key: "assignments",
    label: "All assignments completed",
    done: false,
    warning: "3 teachers have outstanding results",
  },
  {
    key: "approval",
    label: "Pending attendance approvals",
    done: false,
    warning: "2 attendance records require approval",
  },
];

interface StartSessionModalProps {
  onClose: () => void;
  onConfirm: (data: {
    name: string;
    startDate: string;
    endDate: string;
    term: string;
  }) => void;
}

export function StartSessionModal({
  onClose,
  onConfirm,
}: StartSessionModalProps) {
  const [step, setStep] = useState<"checklist" | "form">("checklist");
  const [form, setForm] = useState({
    name: "2027/2028",
    startDate: "2027-09-01",
    endDate: "2028-08-31",
    term: "First Term",
  });

  const allDone = CHECKLIST.every((c) => c.done);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white">
          <h2 className="font-bold text-[17px] text-slate-900">
            {step === "checklist"
              ? "Session Closing Checklist"
              : "Start New Academic Session"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {step === "checklist" && (
            <>
              <p className="text-sm text-slate-500">
                Review the checklist below before archiving the current session
                and starting a new one.
              </p>
              <div className="space-y-2.5">
                {CHECKLIST.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      item.done
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.done ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <AlertTriangle size={16} className="text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.label}
                      </p>
                      {item.warning && (
                        <p className="text-xs mt-0.5 text-amber-700">
                          ⚠ {item.warning}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {allDone ? (
                <div className="p-3 rounded-lg text-sm font-semibold text-center bg-emerald-100 text-emerald-800">
                  ✓ Ready to archive current session
                </div>
              ) : (
                <div className="p-3 rounded-lg text-sm bg-amber-100 text-amber-800">
                  There are outstanding items. You may still proceed, but it is
                  recommended to resolve them first.
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep("form")}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  Continue to New Session
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {step === "form" && (
            <>
              <div className="p-3 rounded-lg text-sm bg-amber-100 border border-amber-200 text-amber-800">
                <strong>Warning:</strong> Starting a new session will archive
                the current active session. Existing attendance, results,
                assignments, and other academic records will be preserved as
                historical records and will not be deleted.
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">
                    Session Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. 2027/2028"
                    className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, startDate: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-slate-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, endDate: e.target.value }))
                      }
                      className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">
                    Current Term
                  </label>
                  <select
                    value={form.term}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, term: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  >
                    <option>First Term</option>
                    <option>Second Term</option>
                    <option>Third Term</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => onConfirm(form)}
                  disabled={!form.name || !form.startDate || !form.endDate}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors cursor-pointer ${
                    form.name && form.startDate && form.endDate
                      ? "bg-indigo-500 hover:bg-indigo-600"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Plus size={14} /> Start New Session
                </button>
                <button
                  onClick={() => setStep("checklist")}
                  className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
