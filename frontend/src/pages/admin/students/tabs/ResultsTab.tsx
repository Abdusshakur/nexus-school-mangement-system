import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { fetchStudentResults, type TermResultDetailResponse } from "../../../../api/adminResults";
import { Skeleton } from "../../../../components/ui/Skeleton";

export function ResultsTab({
  studentId,
  grade: _grade,
  session,
  allowedSubjects,
}: {
  studentId: string;
  grade: string;
  session: string;
  allowedSubjects?: string[];
}) {
  const [resultsData, setResultsData] = useState<TermResultDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchStudentResults(studentId)
      .then((data) => {
        if (mounted) setResultsData(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Error handled globally via interceptor toast
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  // Filter for the selected session
  const currentTermResults = resultsData.filter(r => r.term_result.academic_session_name === session);

  if (currentTermResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
        <p className="text-sm">No results published for {session}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {currentTermResults.map((termBlock) => {
        const tr = termBlock.term_result;
        let subjects = termBlock.subject_results;
        if (allowedSubjects) {
          subjects = subjects.filter(s => allowedSubjects.includes(s.subject_name));
        }

        const totalSubjects = subjects.length;
        const avg = tr.average_score;
        const distinctions = subjects.filter(s => s.grade === "A" || s.grade === "A+").length;
        const passes = subjects.filter(s => s.grade !== "F").length;

        return (
          <div key={tr.id} className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  label: "Average Score",
                  value: `${avg}%`,
                  max: "",
                  color:
                    avg >= 75
                      ? "text-indigo-500"
                      : avg >= 50
                        ? "text-indigo-500"
                        : "text-amber-500",
                },
                {
                  label: "Distinctions",
                  value: distinctions,
                  max: `/${totalSubjects} subjects`,
                  color: "text-indigo-600",
                },
                {
                  label: "Passes",
                  value: passes,
                  max: `/${totalSubjects} subjects`,
                  color: "text-indigo-500",
                },
                {
                  label: "Overall Grade",
                  value: tr.grade,
                  max: "",
                  color: "text-amber-500",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-xl p-4 border border-slate-200"
                >
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`font-bold mt-0.5 text-[26px] ${s.color}`}>
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-400">{s.max}</p>
                </div>
              ))}
            </div>

            {/* Result table */}
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">
                  {tr.academic_term_name} Results
                </h3>
                <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  <Download size={14} /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Total Score</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Percentage</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {subjects.map((r) => {
                      return (
                        <tr
                          key={r.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {r.subject_name}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-slate-900">
                            {r.total_score}
                          </td>
                          <td className="px-4 py-3 text-center text-slate-700">
                            {r.percentage}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700`}
                            >
                              {r.grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
