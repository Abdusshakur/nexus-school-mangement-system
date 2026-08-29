import { X, GraduationCap, Calendar, Download } from "lucide-react";
import { getGradeLetter } from "./ReportCardsTab";

export function ReportCardModal({
  student,
  onClose,
}: {
  student: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl my-8 relative shadow-2xl">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              <Download size={16} /> Download PDF
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Report Card Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-600/20">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Nexus High School</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              End of Term Academic Report
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Student Name</p>
              <p className="font-bold text-slate-900">{student.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Class</p>
              <p className="font-bold text-slate-900">SS 2 Science</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Term & Session</p>
              <p className="font-bold text-slate-900">3rd Term, 2025/2026</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Status</p>
              <p className={`font-bold ${student.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {student.status}
              </p>
            </div>
          </div>

          <div className="overflow-hidden border border-slate-200 rounded-xl mb-8">
            <table className="w-full">
              <thead>
                <tr className="bg-indigo-50 border-b border-indigo-100">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-indigo-900">Subject</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-indigo-900">CA (40)</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-indigo-900">Exam (60)</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-indigo-900">Total (100)</th>
                  <th className="px-5 py-3 text-center text-xs font-bold uppercase tracking-wider text-indigo-900">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.subjects.map((sub: any) => {
                  const gs = getGradeLetter(sub.total);
                  return (
                    <tr key={sub.name} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-semibold text-slate-900">{sub.name}</td>
                      <td className="px-5 py-4 text-center font-medium text-slate-600">{sub.ca}</td>
                      <td className="px-5 py-4 text-center font-medium text-slate-600">{sub.exam}</td>
                      <td className="px-5 py-4 text-center font-bold text-slate-900">{sub.total}</td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gs.bg} ${gs.color}`}>
                          {gs.l}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-800">Final Average</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{student.average.toFixed(1)}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-emerald-800">Class Rank</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{student.rank}</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4">
              <Calendar className="text-slate-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Attendance Summary</p>
                <p className="text-sm text-slate-600 mt-1">Present: 64 days</p>
                <p className="text-sm text-slate-600">Absent: 2 days</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Class Teacher's Remark</p>
              <p className="text-sm font-medium text-slate-800 italic">
                "{student.name} is a brilliant and hardworking student. Keep up the excellent work next session!"
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">Mr. Ade Okafor</p>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Principal's Remark</p>
              <p className="text-sm font-medium text-slate-800 italic">
                "An outstanding performance. Promoted to SS 3."
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-900">Dr. Sarah Johnson</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
