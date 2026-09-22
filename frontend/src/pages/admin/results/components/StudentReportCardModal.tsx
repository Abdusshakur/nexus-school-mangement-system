import { X, Printer, Download, Award, Target, BookOpen } from "lucide-react";
import type { TermResultDetailResponse } from "../../../../api/adminResults";

interface StudentReportCardModalProps {
  result: TermResultDetailResponse;
  onClose: () => void;
}

export function StudentReportCardModal({
  result,
  onClose,
}: StudentReportCardModalProps) {
  const { term_result, subject_results } = result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Student Report Card
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Official Term Results
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold">
              <Printer size={16} /> Print
            </button>
            <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold">
              <Download size={16} /> Export PDF
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Report Card Content */}
        <div className="p-8 overflow-y-auto bg-white" id="report-card-print">
          {/* School Header */}
          <div className="text-center mb-8 border-b-2 border-indigo-100 pb-8">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
              Nexus International School
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              Knowledge is Light
            </p>
            <div className="inline-block mt-4 px-6 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
              <p className="text-sm font-bold text-indigo-800 uppercase tracking-widest">
                Term Report Card
              </p>
            </div>
          </div>

          {/* Student Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Student Name
              </p>
              <p className="font-bold text-slate-900">
                {term_result.student_name}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Admission No
              </p>
              <p className="font-bold text-slate-900">
                {term_result.admission_number}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Class
              </p>
              <p className="font-bold text-slate-900">{term_result.class_name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Academic Term
              </p>
              <p className="font-bold text-slate-900">
                {term_result.academic_term_name}
              </p>
            </div>
          </div>

          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <Target size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 mb-1">
                  Overall Average
                </p>
                <p className="text-3xl font-black text-emerald-600">
                  {term_result.average_score.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Award size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-800 mb-1">
                  Final Grade
                </p>
                <p className="text-3xl font-black text-blue-600">
                  {term_result.grade}
                </p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-100 p-5 rounded-xl flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <BookOpen size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800 mb-1">
                  Total Subjects
                </p>
                <p className="text-3xl font-black text-purple-600">
                  {subject_results.length}
                </p>
              </div>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="mb-8 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-4 text-sm font-bold tracking-wider w-1/3">
                    SUBJECT
                  </th>
                  <th className="px-6 py-4 text-sm font-bold tracking-wider text-center">
                    CA SCORE
                  </th>
                  <th className="px-6 py-4 text-sm font-bold tracking-wider text-center">
                    EXAM SCORE
                  </th>
                  <th className="px-6 py-4 text-sm font-bold tracking-wider text-center">
                    TOTAL
                  </th>
                  <th className="px-6 py-4 text-sm font-bold tracking-wider text-center">
                    GRADE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subject_results.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {sub.subject_name}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {sub.ca_score ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {sub.exam_score ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-center font-black text-indigo-600 text-lg">
                      {sub.total_score}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 font-bold text-slate-700 bg-slate-200 rounded-lg">
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-16 pt-8 border-t-2 border-dashed border-slate-200">
            <div className="text-center">
              <div className="w-48 h-px bg-slate-400 mx-auto mb-2"></div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Form Teacher</p>
              <p className="text-xs text-slate-500 mt-1">Sign & Date</p>
            </div>
            <div className="text-center">
              <div className="w-48 h-px bg-slate-400 mx-auto mb-2"></div>
              <p className="text-sm font-bold text-slate-800 uppercase tracking-wider">Principal</p>
              <p className="text-xs text-slate-500 mt-1">Sign & Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
