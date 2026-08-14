import { CheckCircle } from "lucide-react";
import type { AcademicClass } from "../../../../api/academics";

interface ClassesTabProps {
  classes: AcademicClass[];
}

export function ClassesTab({ classes }: ClassesTabProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-900">
          Enrolled Classes ({classes.length})
        </h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50">
            {["CLASS", "LEVEL", "STATUS"].map((h) => (
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
          {classes.map((cls) => {
            const isJunior = cls.name.startsWith("JSS");
            return (
              <tr
                key={cls.id}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3 text-sm font-medium text-slate-900">
                  {cls.name}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${isJunior ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {isJunior ? "Junior" : "Senior"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-1 text-sm font-medium text-emerald-500">
                    <CheckCircle size={13} /> Active
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
