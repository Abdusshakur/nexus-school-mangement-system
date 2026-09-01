import { useState } from "react";
import type { AcademicTerm } from "../../../../store/session.store";
import { useSessionStore } from "../../../../store/session.store";
import { Plus, X } from "lucide-react";
import { Spinner } from "../../../../components/ui/Spinner";
function fmtDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface TermsTabProps {
  sessionId: string;
  isActive: boolean;
  terms: AcademicTerm[];
}

export function TermsTab({ sessionId, isActive, terms }: TermsTabProps) {
  const { addNewTerm } = useSessionStore();
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newTermName, setNewTermName] = useState("");
  const [newTermStart, setNewTermStart] = useState("");
  const [newTermEnd, setNewTermEnd] = useState("");
  const [makeActive, setMakeActive] = useState(false);

  // Close term modal state
  const [termToClose, setTermToClose] = useState<AcademicTerm | null>(null);

  const activeTerm = terms.find(t => t.status === "active");

  const isTermPremature = (term: AcademicTerm | undefined) => {
    return term && term.endDate ? new Date(term.endDate).getTime() > new Date().getTime() : false;
  };

  const handleAddTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermName || !newTermStart || !newTermEnd) return;

    setIsSaving(true);
    try {
      await addNewTerm(sessionId, {
        name: newTermName,
        startDate: newTermStart,
        endDate: newTermEnd,
        isActive: makeActive,
      });
      setShowAddTerm(false);
      setNewTermName("");
      setNewTermStart("");
      setNewTermEnd("");
      setMakeActive(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        {isActive && (
          <button
            onClick={() => setShowAddTerm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={15} /> Add Term
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {terms.map((term) => {
          const isTermActive = term.status === "active";
          return (
            <div
              key={term.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">{term.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${isTermActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}
                >
                  {isTermActive ? "Active" : "Closed"}
                </span>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="">Start</span>
                  <span className="text-slate-900 font-medium">
                    {fmtDate(term.startDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="">End</span>
                  <span className="text-slate-900 font-medium">
                    {fmtDate(term.endDate)}
                  </span>
                </div>
              </div>
              {isTermActive && isActive && (
                <button
                  onClick={() => setTermToClose(term)}
                  className="w-full py-2 rounded-lg text-sm font-semibold mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors cursor-pointer"
                >
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

      {showAddTerm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Add New Term</h2>
              <button
                onClick={() => setShowAddTerm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTerm} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Term Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newTermName}
                    onChange={(e) => setNewTermName(e.target.value)}
                    placeholder="e.g. Second Term"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newTermStart}
                      onChange={(e) => setNewTermStart(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newTermEnd}
                      onChange={(e) => setNewTermEnd(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 mt-2 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      id="make-active"
                      type="checkbox"
                      checked={makeActive}
                      onChange={(e) => setMakeActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                    />
                  </div>
                  <div className="text-sm">
                    <label
                      htmlFor="make-active"
                      className="font-medium text-indigo-900 cursor-pointer"
                    >
                      Make this term Active immediately
                    </label>
                    <p className="text-indigo-700/80 text-[13px] mt-0.5 leading-snug">
                      Warning: If you check this, the currently active term will
                      be automatically closed. Leave unchecked to add this term
                      in advance without closing the current term.
                    </p>
                  </div>
                </div>

                {makeActive && isTermPremature(activeTerm) && (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 mt-4">
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 shrink-0 mt-0.5 font-bold text-lg">⚠</div>
                      <div>
                        <h4 className="font-bold text-red-900 text-sm">Warning: Current Term Not Yet Over</h4>
                        <p className="text-sm text-red-700 mt-1">
                          The current active term officially ends on <strong>{new Date(activeTerm!.endDate).toLocaleDateString()}</strong>. Making this new term active now will prematurely close the current term. Are you absolutely sure you want to proceed?
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTerm(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      Saving...
                    </>
                  ) : (
                    "Save Term"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {termToClose && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-900">Close {termToClose.name}</h2>
              <button
                onClick={() => setTermToClose(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-slate-700 mb-6">
                Are you sure you want to close <strong>{termToClose.name}</strong>? This will lock grades and attendance for this term.
              </p>

              {isTermPremature(termToClose) && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-red-500 shrink-0 mt-0.5 font-bold text-lg">⚠</div>
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">Warning: Term Not Yet Over</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This term officially ends on <strong>{new Date(termToClose.endDate).toLocaleDateString()}</strong>. Closing it now will prematurely end the term. Are you absolutely sure you want to proceed?
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTermToClose(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // TODO: await API when backend supports it
                    alert("Close Term functionality is pending backend implementation.");
                    setTermToClose(null);
                  }}
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors shadow-sm cursor-pointer"
                >
                  Confirm Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
