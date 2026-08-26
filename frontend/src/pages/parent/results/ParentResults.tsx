import { useState } from "react";
import { useSessionStore } from "../../../store/session.store";
import { mockProfile } from "../dashboard/data";
import { genResult, getSubjectsForClass } from "./utils";
import { ResultsTable } from "./components/ResultsTable";

export function ParentResults() {
  const { academicSessions } = useSessionStore();
  const profile = mockProfile;
  const children = profile?.children ?? [];

  const [childIdx, setChildIdx] = useState(0);
  const [termIdx, setTermIdx] = useState(0);

  const child = children[childIdx];
  const terms = ["First Term", "Second Term", "Third Term"];
  const term = terms[termIdx];

  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    const active = academicSessions.find((s) => s.status === "active");
    return active?.id ?? (academicSessions[0]?.id ?? "");
  });

  const selectedSession = academicSessions.find(
    (s) => s.id === selectedSessionId
  );
  const sessionLabel = selectedSession?.name ?? "2025/2026";

  const subjects = child ? getSubjectsForClass(child.classId) : [];
  const results = subjects.map((sub) => ({
    subject: sub,
    ...genResult(child?.name || "Unknown", sub, term),
  }));

  const avg =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + r.total, 0) / results.length
        )
      : 0;

  return (
    <div className="space-y-5 max-w-5xl pb-10">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">
          Academic Results
        </h1>
        <p className="text-sm mt-0.5 text-slate-500">
          View your child's academic performance by term
        </p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl py-16 text-center border border-slate-200">
          <p className="font-semibold mb-1 text-slate-900">
            No children linked
          </p>
          <p className="text-sm text-slate-400">
            Contact the school office to link your children.
          </p>
        </div>
      ) : (
        <>
          {/* Child selector */}
          <div className="flex gap-2 flex-wrap">
            {children.map((c, i) => (
              <button
                key={c.id || i}
                onClick={() => setChildIdx(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border-2 ${
                  childIdx === i
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c.name}
                <span className="ml-1.5 text-xs opacity-70">
                  {c.className}
                </span>
              </button>
            ))}
          </div>

          {/* Session + term */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-indigo-700 bg-indigo-50 outline-none cursor-pointer"
            >
              {academicSessions.length > 0 ? (
                academicSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option value="">{sessionLabel}</option>
              )}
            </select>
            <div className="flex gap-1">
              {terms.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setTermIdx(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    termIdx === i
                      ? "bg-indigo-500 text-white"
                      : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Results table */}
          {child && (
            <ResultsTable
              childName={child.name}
              className={child.className}
              term={term}
              results={results}
              avg={avg}
            />
          )}

          <p className="text-xs text-slate-400">
            * Results are for viewing only. Contact the school for any
            discrepancies.
          </p>
        </>
      )}
    </div>
  );
}
