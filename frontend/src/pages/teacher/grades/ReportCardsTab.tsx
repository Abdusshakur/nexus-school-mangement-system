import { useState } from "react";
import { CheckCircle, AlertCircle, FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReportCardModal } from "./ReportCardModal";

export function getGradeLetter(pct: number) {
  if (pct >= 75) return { l: "A1", bg: "bg-emerald-100", color: "text-emerald-800" };
  if (pct >= 70) return { l: "B2", bg: "bg-emerald-100", color: "text-emerald-800" };
  if (pct >= 65) return { l: "B3", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 60) return { l: "C4", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 55) return { l: "C5", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 50) return { l: "C6", bg: "bg-amber-100", color: "text-amber-800" };
  if (pct >= 45) return { l: "D7", bg: "bg-amber-100", color: "text-amber-800" };
  if (pct >= 40) return { l: "E8", bg: "bg-red-100", color: "text-red-800" };
  return { l: "F9", bg: "bg-red-100", color: "text-red-800" };
}

const MOCK_REPORT_CARDS = [
  {
    id: "S001",
    name: "Amelia Johnson",
    initials: "AJ",
    color: "bg-indigo-500",
    average: 84.5,
    rank: "1st",
    status: "DRAFT",
    subjects: [
      { name: "Mathematics", ca: 35, exam: 58, total: 93 },
      { name: "English", ca: 30, exam: 45, total: 75 },
      { name: "Biology", ca: 32, exam: 55, total: 87 },
      { name: "Physics", ca: 28, exam: 51, total: 79 },
      { name: "Chemistry", ca: 34, exam: 54, total: 88 },
    ],
  },
  {
    id: "S003",
    name: "Sofia Rodriguez",
    initials: "SR",
    color: "bg-amber-500",
    average: 68.2,
    rank: "3rd",
    status: "DRAFT",
    subjects: [
      { name: "Mathematics", ca: 25, exam: 45, total: 70 },
      { name: "English", ca: 28, exam: 40, total: 68 },
      { name: "Biology", ca: 24, exam: 35, total: 59 },
      { name: "Physics", ca: 22, exam: 41, total: 63 },
      { name: "Chemistry", ca: 30, exam: 51, total: 81 },
    ],
  },
  {
    id: "S007",
    name: "Layla Hassan",
    initials: "LH",
    color: "bg-sky-500",
    average: 79.8,
    rank: "2nd",
    status: "DRAFT",
    subjects: [
      { name: "Mathematics", ca: 32, exam: 50, total: 82 },
      { name: "English", ca: 35, exam: 55, total: 90 },
      { name: "Biology", ca: 28, exam: 45, total: 73 },
      { name: "Physics", ca: 29, exam: 48, total: 77 },
      { name: "Chemistry", ca: 31, exam: 46, total: 77 },
    ],
  },
  {
    id: "S009",
    name: "Femi Adeyemi",
    initials: "FA",
    color: "bg-emerald-500",
    average: 45.4,
    rank: "5th",
    status: "DRAFT",
    subjects: [
      { name: "Mathematics", ca: 15, exam: 25, total: 40 },
      { name: "English", ca: 20, exam: 30, total: 50 },
      { name: "Biology", ca: 18, exam: 22, total: 40 },
      { name: "Physics", ca: 14, exam: 35, total: 49 },
      { name: "Chemistry", ca: 22, exam: 26, total: 48 },
    ],
  },
  {
    id: "S010",
    name: "Chidi Okafor",
    initials: "CO",
    color: "bg-purple-500",
    average: 58.6,
    rank: "4th",
    status: "DRAFT",
    subjects: [
      { name: "Mathematics", ca: 20, exam: 40, total: 60 },
      { name: "English", ca: 25, exam: 35, total: 60 },
      { name: "Biology", ca: 22, exam: 41, total: 63 },
      { name: "Physics", ca: 19, exam: 30, total: 49 },
      { name: "Chemistry", ca: 28, exam: 33, total: 61 },
    ],
  },
];

export function ReportCardsTab() {
  const [reportCards, setReportCards] = useState(MOCK_REPORT_CARDS);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const globalStatus = reportCards[0].status; // Assume all share status in this mock

  const handleSubmitAll = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setReportCards((prev) => prev.map((rc) => ({ ...rc, status: "SUBMITTED" })));
      setIsSubmitting(false);
      toast.success("Report cards successfully submitted to Admin for approval.");
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
            <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900">Termly Report Cards (SS 2 Science)</h3>
            <p className="text-xs text-indigo-700 mt-0.5">
              Review individual student performance before submitting to Admin.
            </p>
          </div>
        </div>
        {globalStatus === "DRAFT" ? (
          <button
            onClick={handleSubmitAll}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit to Admin
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 text-sm font-semibold rounded-lg">
            <CheckCircle size={16} />
            Submitted for Approval
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Average
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Grade
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rank
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reportCards.map((rc) => {
              const gs = getGradeLetter(rc.average);
              return (
                <tr key={rc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${rc.color}`}>
                        <span className="font-bold text-[11px]">{rc.initials}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-900">{rc.name}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-sm font-bold ${rc.average >= 50 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {rc.average.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gs.bg} ${gs.color}`}>
                      {gs.l}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-sm font-semibold text-slate-700">{rc.rank}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                      rc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      rc.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {rc.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedStudent(rc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ml-auto"
                    >
                      <FileText size={14} /> View Card
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <ReportCardModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
