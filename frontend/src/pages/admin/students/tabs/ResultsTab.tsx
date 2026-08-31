import { Download } from "lucide-react";
import { generateResults, getGradeColor } from "../data";
import { useSubjectStore } from "../../../../store/subject.store";
import type { AcademicSubject } from "../../../../api/academics";

//  Result tab component for displaying student results in a table format with summary statistics.

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
  const { subjects } = useSubjectStore();
  const subjectNames = subjects.map((s: AcademicSubject) => s.name);
  const rawResults = generateResults(studentId, subjectNames, session);
  const results = allowedSubjects ? rawResults.filter(r => allowedSubjects.includes(r.subject)) : rawResults;
  const avg = results.length > 0 ? Math.round(
    results.reduce((a, r) => a + r.total, 0) / (results.length || 1),
  ) : 0;
  const totalSubjects = results.length;
  const distinctions = results.filter((r) => r.total >= 165).length;
  const passes = results.filter((r) => r.total >= 120).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Average Score",
            value: avg,
            max: "/220",
            color:
              avg >= 165
                ? "text-indigo-500"
                : avg >= 135
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
            label: "Class Position",
            value: "#" + (3 + (parseInt(studentId.replace("S", ""), 10) % 8)),
            max: "/ 42 students",
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
            Subject Results {session}
          </h3>
          <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <Download size={14} /> Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {[
                  "Subject",
                  "CA1 /20",
                  "CA2 /20",
                  "Mid /80",
                  "CA3 /20",
                  "Final /80",
                  "Total /220",
                  "Grade",
                  "Remark",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => {
                const gc = getGradeColor(r.grade);
                return (
                  <tr
                    key={r.subject}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {r.subject}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.ca1}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.ca2}
                    </td>
                    <td
                      className={`px-4 py-3 text-center ${r.mid < 40 ? "text-red-500" : "text-slate-700"}`}
                    >
                      {r.mid}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {r.ca3}
                    </td>
                    <td
                      className={`px-4 py-3 text-center ${r.fin < 40 ? "text-red-500" : "text-slate-700"}`}
                    >
                      {r.fin}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {r.total}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gc}`}
                      >
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {r.remark}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Total  */}
            <tfoot>
              <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                <td className="px-4 py-3 font-bold text-xs uppercase tracking-wide text-slate-900">
                  Overall Average
                </td>
                <td colSpan={5} />
                <td className="px-4 py-3 text-center font-bold text-indigo-600 text-base">
                  {avg}
                </td>
                <td className="px-4 py-3 text-center">
                  {(() => {
                    const gc = getGradeColor(
                      avg >= 165
                        ? "A"
                        : avg >= 150
                          ? "B+"
                          : avg >= 135
                            ? "B"
                            : avg >= 120
                              ? "C"
                              : "D",
                    );
                    return (
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gc}`}
                      >
                        {avg >= 165
                          ? "A"
                          : avg >= 150
                            ? "B+"
                            : avg >= 135
                              ? "B"
                              : avg >= 120
                                ? "C"
                                : "D"}
                      </span>
                    );
                  })()}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
