import { Users } from "lucide-react";

const SAMPLE_STUDENTS = [
  { name: "Amelia Johnson", admNo: "WW/2024/001", cls: "SS 2 Science" },
  { name: "Emeka Okafor", admNo: "WW/2024/002", cls: "JSS 3A" },
  { name: "Ngozi Adeyemi", admNo: "WW/2024/003", cls: "SS 1 Arts" },
  { name: "Chidi Ibrahim", admNo: "WW/2024/004", cls: "SS 3 Science" },
  { name: "Fatima Bello", admNo: "WW/2024/005", cls: "JSS 2B" },
];

export function StudentsTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
        <Users size={18} className="text-indigo-500" />
        <p className="text-sm font-semibold text-indigo-900">
          250 students enrolled in this session
        </p>
      </div>
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Sample Students</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              {["NAME", "ADMISSION NO.", "CLASS"].map((h) => (
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
            {SAMPLE_STUDENTS.map((s) => (
              <tr
                key={s.admNo}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3 text-sm font-medium text-slate-900">
                  {s.name}
                </td>
                <td className="px-5 py-3 text-sm text-indigo-500 font-medium">
                  {s.admNo}
                </td>
                <td className="px-5 py-3 text-sm text-slate-600">
                  {s.cls}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
