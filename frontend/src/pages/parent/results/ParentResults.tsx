import { useState, useEffect, useMemo } from "react";
import { useParentContextStore } from "../../../store/parentContext.store";
import { getGradeStyles } from "./utils";
import { ResultsTable } from "./components/ResultsTable";

import { Skeleton } from "../../../components/ui/Skeleton";

export function ParentResults() {
  const { children, childResults, loadChildResults, loadChildren, loadingChildren, loadingResults } = useParentContextStore();

  const [childIdx, setChildIdx] = useState(0);
  const child = children[childIdx];
  const isLoadingRecords = child ? loadingResults[child.id] : false;

  const [selectedResultId, setSelectedResultId] = useState<string>("");

  useEffect(() => {
    if (children.length === 0) {
      loadChildren();
    }
  }, [children.length, loadChildren]);

  useEffect(() => {
    if (child && !childResults[child.id]) {
      loadChildResults(child.id);
    }
  }, [child, childResults, loadChildResults]);

  const rawResults = child ? childResults[child.id] || [] : [];

  // Auto-select the first result if none is selected
  useEffect(() => {
    if (rawResults.length > 0 && (!selectedResultId || !rawResults.find(r => r.term_result.id === selectedResultId))) {
      setSelectedResultId(rawResults[0].term_result.id);
    }
  }, [rawResults, selectedResultId]);

  const selectedData = useMemo(() => {
    if (!selectedResultId) return null;
    return rawResults.find(r => r.term_result.id === selectedResultId) || null;
  }, [rawResults, selectedResultId]);

  const mappedResults = selectedData ? selectedData.subject_results.map(sr => {
    const gradeStyles = getGradeStyles(sr.grade);
    return {
      subject: sr.subject_name,
      ca: sr.ca_score ?? 0,
      exam: sr.exam_score ?? 0,
      total: sr.total_score,
      grade: sr.grade || "N/A",
      bg: gradeStyles.bg,
      text: gradeStyles.text,
      remark: "-", // Backend does not return remark for subject yet
    };
  }) : [];

  const avg = selectedData ? Math.round(selectedData.term_result.average_score) : 0;
  const termGrade = selectedData?.term_result?.grade || "N/A";

  if (loadingChildren) {
    return (
      <div className="space-y-5 max-w-5xl pb-10">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

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
                key={c.id}
                onClick={() => setChildIdx(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border-2 ${childIdx === i
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {c.first_name}
                <span className="ml-1.5 text-xs opacity-70">
                  {c.class_name}
                </span>
              </button>
            ))}
          </div>

          {/* Session + term selector (Based on available results) */}
          {isLoadingRecords ? (
            <Skeleton className="h-10 w-48 rounded-lg" />
          ) : rawResults.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={selectedResultId}
                onChange={(e) => setSelectedResultId(e.target.value)}
                className="px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-indigo-700 bg-indigo-50 outline-none cursor-pointer"
              >
                {rawResults.map((r) => (
                  <option key={r.term_result.id} value={r.term_result.id}>
                    {r.term_result.academic_session_name} {r.term_result.academic_term_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Results table */}
          {isLoadingRecords ? (
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-end mb-4">
                <Skeleton className="h-20 w-48 rounded-xl" />
                <Skeleton className="h-20 w-24 rounded-xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
          ) : child && selectedData ? (
            <ResultsTable
              childName={child.first_name}
              className={child.class_name}
              term={selectedData.term_result.academic_term_name}
              results={mappedResults}
              avg={avg}
              termGrade={termGrade}
            />
          ) : (
            <div className="bg-white rounded-xl py-16 text-center border border-slate-200">
              <p className="text-slate-500">No published results available yet.</p>
            </div>
          )}

          {!isLoadingRecords && (
            <p className="text-xs text-slate-400">
              * Results are for viewing only. Contact the school for any discrepancies.
            </p>
          )}
        </>
      )}
    </div>
  );
}
