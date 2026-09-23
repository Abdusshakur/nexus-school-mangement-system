import {
  Lock,
  Send,
  AlertTriangle,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useSessionStore } from "../../../store/session.store";
import { useClassStore } from "../../../store/class.store";
import { useAdminResultsStore } from "../../../store/adminResults.store";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Spinner } from "../../../components/ui/Spinner";
import type { TermResultDetailResponse } from "../../../api/adminResults";
import { fetchStudentsList } from "../../../api/students";
import type { StudentResponse } from "../../../api/students";
import { StudentReportCardModal } from "./components/StudentReportCardModal";

export function ReportCardsPage() {
  const {
    academicSessions,
    fetchSessions,
    loading: loadingSessions,
  } = useSessionStore();

  const { classes, loadClasses } = useClassStore();

  const {
    termPublicationStatus,
    loadingPublication,
    loadTermPublicationStatus,
    publishTermResults,
    lockTermResults,
    classResults,
    loadingClassResults,
    loadClassResults,
  } = useAdminResultsStore();

  useEffect(() => {
    if (academicSessions.length === 0) {
      fetchSessions();
    }
    loadClasses();
  }, [academicSessions.length, fetchSessions, loadClasses]);

  const activeSession = academicSessions.find((s) => s.status === "active");
  const terms = useMemo(() => activeSession?.terms || [], [activeSession]);

  const [selectedTermIdRaw, setSelectedTermId] = useState<string | null>(null);
  const selectedTermId =
    selectedTermIdRaw ??
    (terms.find((t) => t.status === "active")?.id || terms[0]?.id || "");

  // If null show the list of classes. If set, we show the students in that class.
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // If null show the list of students. If set, we show the raw subject scores for that student.
  const [selectedStudentResult, setSelectedStudentResult] =
    useState<TermResultDetailResponse | null>(null);

  const [showReportCardModal, setShowReportCardModal] = useState(false);

  // Students in the currently selected class
  const [classStudents, setClassStudents] = useState<StudentResponse[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch publication status for selected term
  useEffect(() => {
    if (selectedTermId) {
      loadTermPublicationStatus(selectedTermId);
    }
  }, [selectedTermId, loadTermPublicationStatus]);

  // Fetch class results when a class is selected
  useEffect(() => {
    if (selectedTermId && selectedClassId) {
      loadClassResults(selectedClassId, selectedTermId);

      // fetch the students for this class and list them even if no result is calculated
      const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
          const selectedClass = classes.find((c) => c.id === selectedClassId);
          if (selectedClass) {
            const students = await fetchStudentsList(
              undefined,
              selectedClass.name,
            );
            setClassStudents(students);
          }
        } catch (error) {
          console.error("Failed to fetch students for class", error);
        } finally {
          setLoadingStudents(false);
        }
      };
      fetchStudents();
    }
  }, [selectedTermId, selectedClassId, loadClassResults, classes]);

  const [confirmModal, setConfirmModal] = useState<{
    type: "PUBLISH" | "LOCK";
    termId: string;
    termName: string;
  } | null>(null);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    if (confirmModal.type === "PUBLISH") {
      await publishTermResults(confirmModal.termId);
    } else {
      await lockTermResults(confirmModal.termId);
    }
    setConfirmModal(null);
  };

  if (loadingSessions && academicSessions.length === 0) {
    return (
      <div className="space-y-6 w-full pb-10">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const selectedTerm = terms.find((t) => t.id === selectedTermId);
  const pubStatus = selectedTermId
    ? termPublicationStatus[selectedTermId]
    : "DRAFT";
  const isPubLoading = selectedTermId
    ? loadingPublication[selectedTermId]
    : false;

  const resultsKey = `${selectedClassId}-${selectedTermId}`;
  const currentResults = classResults[resultsKey] || [];
  const isLoadingResults = loadingClassResults[resultsKey] || false;

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Merge students with their results if available
  const mergedStudents = classStudents.map((student) => {
    const result = currentResults.find(
      (r) => r.term_result.student_id === student.id,
    );
    return {
      student,
      result,
    };
  });

  return (
    <div className="space-y-6 w-full pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Term Results</h1>
          <p className="text-sm mt-0.5 text-slate-500">
            Preview student results and manage term publication
          </p>
        </div>

        {/* Term Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedTermId}
            onChange={(e) => {
              setSelectedTermId(e.target.value);
              setSelectedClassId(null);
              setSelectedStudentResult(null);
            }}
            className="pl-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white shadow-sm"
          >
            <option value="" disabled>
              Select Term
            </option>
            {terms.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        {selectedStudentResult ? (
          /*  Individual students results */
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedStudentResult(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {selectedStudentResult.term_result.student_name}'s Results
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedStudentResult.term_result.admission_number}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-slate-500 text-xs">Overall Avg: </span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentResult.term_result.average_score.toFixed(1)}
                    %
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs">Grade: </span>
                  <span className="font-bold text-slate-800">
                    {selectedStudentResult.term_result.grade}
                  </span>
                </div>
                <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block"></div>
                <button
                  onClick={() => setShowReportCardModal(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <BookOpen size={16} />
                  View Report Card
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 sticky top-0">
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase ">
                      Subject
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase  text-center">
                      CA Score
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase  text-center">
                      Exam Score
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase  text-center">
                      Total Score
                    </th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase  text-center">
                      Grade
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedStudentResult.subject_results.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {sub.subject_name}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 text-center">
                        {sub.ca_score ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 text-center">
                        {sub.exam_score ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-indigo-700 text-center">
                        {sub.total_score}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                          {sub.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {selectedStudentResult.subject_results.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-slate-500 text-sm"
                      >
                        No subject results found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : selectedClassId ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedClassId(null);
                    setSelectedStudentResult(null);
                  }}
                  className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    {selectedClass?.name} Students
                  </h3>
                  <p className="text-xs text-slate-500">{selectedTerm?.name}</p>
                </div>
              </div>
              {pubStatus !== "DRAFT" && (
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    pubStatus === "PUBLISHED"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {pubStatus}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {isLoadingResults || loadingStudents ? (
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <Spinner size="lg" className="text-indigo-600" />
                </div>
              ) : mergedStudents.length > 0 ? (
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase ">
                        Student
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase ">
                        Avg Score
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase ">
                        Grade
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mergedStudents.map(({ student, result }) => (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="text-sm font-semibold text-slate-900">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.admission_number}
                          </p>
                        </td>
                        <td className="px-5 py-3">
                          {result ? (
                            <span className="text-sm font-bold text-slate-800">
                              {result.term_result.average_score.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {result ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-sm">
                              {result.term_result.grade}
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400 font-medium">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {result ? (
                            <button
                              onClick={() => setSelectedStudentResult(result)}
                              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg"
                            >
                              View Result
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Not calculated
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
                  <AlertCircle size={32} className="text-slate-300 mb-3" />
                  <p className="text-slate-500 font-medium">
                    No students found
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    There are no students enrolled in this class.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen size={16} className="text-indigo-600" />
                Select a Class
              </h3>

              {/* publish and lock result */}
              {selectedTermId && (
                <div className="flex items-center gap-2">
                  {pubStatus === "DRAFT" && (
                    <button
                      onClick={() =>
                        setConfirmModal({
                          type: "PUBLISH",
                          termId: selectedTermId,
                          termName: selectedTerm?.name || "",
                        })
                      }
                      disabled={isPubLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isPubLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Publish All Results
                    </button>
                  )}
                  {pubStatus === "PUBLISHED" && (
                    <button
                      onClick={() =>
                        setConfirmModal({
                          type: "LOCK",
                          termId: selectedTermId,
                          termName: selectedTerm?.name || "",
                        })
                      }
                      disabled={isPubLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {isPubLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Lock size={16} />
                      )}
                      Lock Term Results
                    </button>
                  )}
                  {pubStatus === "LOCKED" && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-semibold rounded-lg border border-slate-200">
                      <Lock size={16} />
                      Term Locked
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase ">
                      Class
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase ">
                      Form Teacher
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase  text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classes.map((cls) => (
                    <tr
                      key={cls.id}
                      className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedClassId(cls.id)}
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {cls.name}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-slate-600">
                          {cls.form_teacher_name || (
                            <span className="text-slate-400 italic">
                              Unassigned
                            </span>
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClassId(cls.id);
                          }}
                          className="flex items-center justify-end gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors ml-auto"
                        >
                          View Results
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {classes.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-slate-500"
                      >
                        No classes found in the system.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                confirmModal.type === "PUBLISH"
                  ? "bg-indigo-100 text-indigo-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {confirmModal.type === "PUBLISH" ? (
                <Send size={24} />
              ) : (
                <AlertTriangle size={24} />
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {confirmModal.type === "PUBLISH"
                ? `Publish ${confirmModal.termName} Results?`
                : `Lock ${confirmModal.termName} Results?`}
            </h3>
            <p className="text-sm text-slate-500">
              {confirmModal.type === "PUBLISH"
                ? "This will publish results for all classes in this term and make them visible to parents. You can lock them later."
                : "Warning: This action is permanent. Once locked, grades for all classes can never be recalculated or modified."}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2 text-sm font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                  confirmModal.type === "PUBLISH"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {confirmModal.type === "PUBLISH" ? "Yes, Publish" : "Yes, Lock"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render the modal outside the main layout when active */}
      {showReportCardModal && selectedStudentResult && (
        <StudentReportCardModal
          result={selectedStudentResult}
          onClose={() => setShowReportCardModal(false)}
        />
      )}
    </div>
  );
}
