import { CheckCircle } from "lucide-react";

export function ReportsTab() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">Report Card Status</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            {["TERM", "PUBLISHED", "TOTAL STUDENTS", "ACTION"].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { term: "First Term", students: 250 },
            { term: "Second Term", students: 250 },
            { term: "Third Term", students: 247 },
          ].map((r) => (
            <tr
              key={r.term}
              className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <td className="px-5 py-3 text-sm font-medium text-slate-900">
                {r.term}
              </td>
              <td className="px-5 py-3">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-500">
                  <CheckCircle size={13} /> Published
                </span>
              </td>
              <td className="px-5 py-3 text-sm text-slate-700">
                {r.students}
              </td>
              <td className="px-5 py-3">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-pointer">
                  View Reports
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
