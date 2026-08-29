import { useState } from "react";
import {
  CheckCircle,
  
  Search,
  Filter,
  Eye,
  
  ChevronDown,
  ChevronRight,
  UserCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getGradeLetter } from "../../teacher/grades/ReportCardsTab";

const MOCK_SUBMISSIONS = [
  {
    id: "sub_1",
    classId: "SS2SCI",
    className: "SS 2 Science",
    term: "3rd Term",
    session: "2025/2026",
    submittedBy: "Mr. Ade Okafor",
    submittedAt: "2026-07-28T10:30:00Z",
    status: "SUBMITTED",
    studentCount: 35,
    average: 68.4,
    highest: 94.2,
    lowest: 38.5,
    students: [
      { id: "S001", name: "Amelia Johnson", average: 84.5 },
      { id: "S003", name: "Sofia Rodriguez", average: 68.2 },
      { id: "S007", name: "Layla Hassan", average: 79.8 },
      { id: "S009", name: "Femi Adeyemi", average: 45.4 },
      { id: "S010", name: "Chidi Okafor", average: 58.6 },
    ],
  },
  {
    id: "sub_2",
    classId: "JSS1A",
    className: "JSS 1A",
    term: "3rd Term",
    session: "2025/2026",
    submittedBy: "Mrs. Folake Smith",
    submittedAt: "2026-07-27T14:15:00Z",
    status: "APPROVED",
    studentCount: 42,
    average: 72.1,
    highest: 96.0,
    lowest: 41.2,
    students: [],
  },
  {
    id: "sub_3",
    classId: "SS3ART",
    className: "SS 3 Arts",
    term: "3rd Term",
    session: "2025/2026",
    submittedBy: "Mr. James Thompson",
    submittedAt: "2026-07-28T09:45:00Z",
    status: "SUBMITTED",
    studentCount: 28,
    average: 64.8,
    highest: 88.5,
    lowest: 42.1,
    students: [],
  },
];

export function ReportCardApprovalsTab() {
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);

  const pendingCount = submissions.filter(
    (s) => s.status === "SUBMITTED",
  ).length;

  const handleApprove = (id: string, className: string) => {
    setApproving(id);
    setTimeout(() => {
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s)),
      );
      setApproving(null);
      toast.success(`Report cards for ${className} have been approved!`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
          <p className="text-sm font-semibold text-indigo-800">
            Pending Approvals
          </p>
          <p className="text-3xl font-black text-indigo-600 mt-1">
            {pendingCount}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
          <p className="text-sm font-semibold text-emerald-800">
            Approved Classes
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {submissions.filter((s) => s.status === "APPROVED").length}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
          <p className="text-sm font-semibold text-slate-700">
            Awaiting Submission
          </p>
          <p className="text-3xl font-black text-slate-600 mt-1">14</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900">Submitted Class Results</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search class..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <button className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {submissions.map((sub) => {
            const isExpanded = expandedId === sub.id;
            const isApproved = sub.status === "APPROVED";

            return (
              <div
                key={sub.id}
                className="transition-colors hover:bg-slate-50/50"
              >
                <div
                  className="p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                >
                  <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      {isExpanded ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                    <div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        {sub.className}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {sub.status}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <UserCircle2 size={12} />
                        Submitted by {sub.submittedBy} on{" "}
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        Class Avg
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {sub.average}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        Students
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {sub.studentCount}
                      </p>
                    </div>

                    <div
                      className="w-40 flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isApproved ? (
                        <button
                          onClick={() => handleApprove(sub.id, sub.className)}
                          disabled={approving === sub.id}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          {approving === sub.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                          Approve All
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold px-4 py-2 bg-emerald-50 rounded-lg">
                          <CheckCircle size={16} /> Approved
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && sub.students.length > 0 && (
                  <div className="px-14 pb-5 pt-2 bg-slate-50/50">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      Student Breakdown
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sub.students.map((student) => {
                        const gs = getGradeLetter(student.average);
                        return (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg"
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">
                                {student.average}%
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${gs.bg} ${gs.color}`}
                              >
                                {gs.l}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5">
                        <Eye size={14} /> View Detailed Report Cards
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && sub.students.length === 0 && (
                  <div className="px-14 pb-5 pt-2 bg-slate-50/50">
                    <p className="text-sm text-slate-500 italic">
                      Detailed student breakdown not available in this mock.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
