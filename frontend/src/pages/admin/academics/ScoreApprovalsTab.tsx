import { useState, useEffect } from "react";
import {
  CheckCircle,


  Eye,

  ChevronDown,
  ChevronRight,
  UserCircle2,
  BookOpen,
  X,
  UserCircle,
} from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";

import { useAdminResultsStore } from "../../../store/adminResults.store";

function SubmissionDetailsModal({
  submissionId,
  onClose,
}: {
  submissionId: string;
  onClose: () => void;
}) {
  const { submissionDetails, loadingDetails, loadSubmissionDetails } = useAdminResultsStore();
  const details = submissionDetails[submissionId];
  const isLoading = loadingDetails[submissionId];

  useEffect(() => {
    loadSubmissionDetails(submissionId);
  }, [submissionId, loadSubmissionDetails]);

  if (isLoading || !details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-indigo-600" />
          <p className="text-slate-500 font-medium text-sm">Loading details...</p>
        </div>
      </div>
    );
  }

  const { submission, students, assessment } = details;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white sm:rounded-2xl w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {assessment.name} Results
            </h2>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="font-semibold text-slate-700">{submission.class_name}</span> • {submission.subject_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - Table */}
        <div className="p-0 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="bg-white sm:rounded-xl border-y sm:border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <UserCircle size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-slate-500">{student.admission_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${student.score_status === "PRESENT"
                          ? "bg-emerald-100 text-emerald-700"
                          : student.score_status === "ABSENT"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                          }`}
                      >
                        {student.score_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-black text-slate-800">
                        {student.score !== null ? student.score : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 italic">
                      {student.remarks || <span className="text-slate-300">No remarks</span>}
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No student data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <UserCircle2 size={16} />
            Submitted by <span className="font-semibold text-slate-700">{submission.teacher_name}</span>
          </p>

        </div>
      </div>
    </div>
  );
}
export function ScoreApprovalsTab() {
  const { submissions, loadingSubmissions, loadSubmissions, approveScoreSubmission, approvingId } = useAdminResultsStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [viewDetailsId, setViewDetailsId] = useState<string | null>(null);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const pendingCount = (submissions || []).filter(
    (s) => s.status === "SUBMITTED",
  ).length;

  const handleApprove = (id: string, className: string) => {
    approveScoreSubmission(id, className);
  };

  if (loadingSubmissions && (!submissions || submissions.length === 0)) {
    return (
      <div className="p-12 flex justify-center">
        <Spinner size="lg" className="text-indigo-600" />
      </div>
    );
  }

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
            Approved Scores
          </p>
          <p className="text-3xl font-black text-emerald-600 mt-1">
            {(submissions || []).filter((s) => s.status === "APPROVED").length}
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
          <h3 className="font-bold text-slate-900">Submitted Subject Scores</h3>

        </div>

        <div className="divide-y divide-slate-100">
          {(submissions || []).map((sub) => {
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
                        {sub.class_name} • {sub.subject_name}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${isApproved
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                        >
                          {sub.status}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <BookOpen size={12} />
                        {sub.assessment_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <UserCircle2 size={12} />
                        Submitted by {sub.teacher_name} on{" "}
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div
                      className="w-40 flex justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!isApproved ? (
                        <button
                          onClick={() => handleApprove(sub.id, sub.class_name)}
                          disabled={approvingId === sub.id}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          {approvingId === sub.id ? (
                            <>
                              <Spinner size="sm" className="text-white" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} />
                              Approve All
                            </>
                          )}
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
                {isExpanded && (
                  <div className="px-14 pb-5 pt-2 bg-slate-50/50">
                    <p className="text-sm text-slate-500 italic mb-4">
                      Click the button below to view a detailed breakdown of all student scores, remarks, and statuses for this submission.
                    </p>
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewDetailsId(sub.id);
                        }}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
                      >
                        <Eye size={14} /> View Detailed Scores
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {(!submissions || submissions.length === 0) && (
            <div className="p-8 text-center text-slate-500">
              No score submissions found.
            </div>
          )}
        </div>
      </div>

      {viewDetailsId && (
        <SubmissionDetailsModal
          submissionId={viewDetailsId}
          onClose={() => setViewDetailsId(null)}
        />
      )}
    </div>
  );
}
