import { getGrade } from "../utils";

interface ResultRow {
  subject: string;
  ca: number;
  exam: number;
  total: number;
  grade: string;
  bg: string;
  text: string;
  remark: string;
}

interface ResultsTableProps {
  childName: string;
  className: string;
  term: string;
  results: ResultRow[];
  avg: number;
}

export function ResultsTable({
  childName,
  className,
  term,
  results,
  avg,
}: ResultsTableProps) {
  const avgGrade = getGrade(avg);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          {childName} · {className} · {term}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["SUBJECT", "CA (30)", "EXAM (70)", "TOTAL (100)", "GRADE", "REMARK"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.subject}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium text-slate-900">
                  {r.subject}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{r.ca}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{r.exam}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900">
                  {r.total}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${r.bg} ${r.text}`}
                  >
                    {r.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">{r.remark}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-4 py-3 text-sm font-bold text-slate-900">
                Average
              </td>
              <td colSpan={2} />
              <td className="px-4 py-3 text-sm font-bold text-indigo-500">
                {avg}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${avgGrade.bg} ${avgGrade.text}`}
                >
                  {avgGrade.grade}
                </span>
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
