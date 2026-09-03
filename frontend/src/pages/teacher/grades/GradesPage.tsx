import { useState, useEffect } from "react";
import {
  CheckCircle,
  Save,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useGradeStore } from "../../../store/grade.store";
import { useTeacherContextStore } from "../../../store/teacherContext.store";
import { ReportCardsTab } from "./ReportCardsTab";

function getNigerianGradeShort(pct: number) {
  if (pct >= 75)
    return { l: "A1", bg: "bg-emerald-100", color: "text-emerald-800" };
  if (pct >= 70)
    return { l: "B2", bg: "bg-emerald-100", color: "text-emerald-800" };
  if (pct >= 65)
    return { l: "B3", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 60)
    return { l: "C4", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 55)
    return { l: "C5", bg: "bg-indigo-100", color: "text-indigo-800" };
  if (pct >= 50)
    return { l: "C6", bg: "bg-amber-100", color: "text-amber-800" };
  if (pct >= 45)
    return { l: "D7", bg: "bg-amber-100", color: "text-amber-800" };
  if (pct >= 40) return { l: "E8", bg: "bg-red-100", color: "text-red-800" };
  return { l: "F9", bg: "bg-red-100", color: "text-red-800" };
}

export default function TeacherGrades() {
  const {
    loadAssessments,
    loadRoster,
    saveScores,
    submitScores,
    assessments,
    rosters,
    loading: apiLoading,
  } = useGradeStore();
  const {
    myAssignments,
    fetchMyAssignments,
    loading: contextLoading,
  } = useTeacherContextStore();

  const [activeTab, setActiveTab] = useState<"grading" | "report_cards">(
    "grading",
  );
  const [step, setStep] = useState<"select" | "enter">("select");

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [assessmentId, setAssessmentId] = useState("");

  const [grades, setGrades] = useState<Record<string, number | "">>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (myAssignments.length === 0) {
      fetchMyAssignments();
    }
  }, [myAssignments.length, fetchMyAssignments]);

  // Derived state
  const uniqueClasses = Array.from(
    new Set(myAssignments.map((a) => a.class_id)),
  ).map((id) => myAssignments.find((a) => a.class_id === id)!);
  const subjectsForClass = classId
    ? myAssignments.filter((a) => a.class_id === classId)
    : [];

  const classKey = `${classId}_${subjectId}`;
  const classAssessments = assessments[classKey] || [];
  const currentAssessment = classAssessments.find((a) => a.id === assessmentId);
  const rosterData = assessmentId ? rosters[assessmentId] : null;

  // Effects to auto-select
  useEffect(() => {
    if (uniqueClasses.length > 0 && !classId)
      setClassId(uniqueClasses[0].class_id);
  }, [uniqueClasses, classId]);

  useEffect(() => {
    if (
      subjectsForClass.length > 0 &&
      (!subjectId || !subjectsForClass.find((s) => s.subject_id === subjectId))
    ) {
      setSubjectId(subjectsForClass[0].subject_id);
    }
  }, [subjectsForClass, subjectId]);

  // Fetch assessments when class and subject are selected
  useEffect(() => {
    if (classId && subjectId) {
      loadAssessments(classId, subjectId).catch(console.error);
    }
  }, [classId, subjectId, loadAssessments]);

  // Fetch roster when assessment is selected and we move to entry
  useEffect(() => {
    if (assessmentId && step === "enter") {
      loadRoster(assessmentId)
        .then((data) => {
          const initialGrades: Record<string, number | ""> = {};
          data.students.forEach((s) => {
            initialGrades[s.student_id] =
              s.score !== null && s.score !== undefined ? s.score : "";
          });
          setGrades(initialGrades);
        })
        .catch(console.error);
    }
  }, [assessmentId, step, loadRoster]);

  const updateGrade = (studentId: string, val: string) => {
    if (!currentAssessment) return;
    const num =
      val === ""
        ? ""
        : Math.max(0, Math.min(currentAssessment.max_score, Number(val)));
    setGrades((prev) => ({ ...prev, [studentId]: num }));
  };

  const handleSave = async (submit: boolean) => {
    if (!assessmentId || !rosterData) return;
    setSaving(true);
    try {
      const payload = {
        scores: rosterData.students.map((s) => {
          const val = grades[s.student_id];
          return {
            student_id: s.student_id,
            score: val === "" ? null : Number(val),
            score_status:
              val === "" ? ("MISSING" as const) : ("PRESENT" as const),
          };
        }),
      };

      await saveScores(assessmentId, payload);

      if (submit && rosterData.submission?.id) {
        await submitScores(rosterData.submission.id);
        setSavedMsg("Grades submitted successfully.");
      } else {
        setSavedMsg("Draft saved successfully.");
      }
      setTimeout(() => setSavedMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setSavedMsg("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const allEntered = rosterData
    ? rosterData.students.every(
        (s) =>
          grades[s.student_id] !== undefined && grades[s.student_id] !== "",
      )
    : false;
  const numGrades = rosterData
    ? rosterData.students.map((s) => Number(grades[s.student_id] ?? 0))
    : [];
  const avg =
    allEntered && numGrades.length
      ? Math.round(numGrades.reduce((a, b) => a + b, 0) / numGrades.length)
      : null;
  const highest =
    allEntered && numGrades.length ? Math.max(...numGrades) : null;
  const passCount =
    allEntered && currentAssessment
      ? numGrades.filter((n) => (n / currentAssessment.max_score) * 100 >= 50)
          .length
      : null;

  return (
    <div className="space-y-5 p-6 max-w-5xl ">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">
          Academics & Results
        </h1>
        <p className="text-sm mt-0.5 text-slate-500">
          Manage subject grading and class report cards.
        </p>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("grading")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "grading"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Subject Grading
        </button>
        <button
          onClick={() => setActiveTab("report_cards")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "report_cards"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Class Report Cards
        </button>
      </div>

      {activeTab === "grading" && step === "select" && (
        <>
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h2 className="font-semibold mb-5 text-slate-900">
              Select Class & Assessment
            </h2>

            {contextLoading && (
              <div className="text-sm text-indigo-600 mb-4 animate-pulse">
                Loading assignments...
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Class
                </label>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setAssessmentId("");
                    setGrades({});
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {uniqueClasses.map((c) => (
                    <option key={c.class_id} value={c.class_id}>
                      {c.class_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(e.target.value);
                    setAssessmentId("");
                    setGrades({});
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {subjectsForClass.map((s) => (
                    <option key={s.subject_id} value={s.subject_id}>
                      {s.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Assessment Component
              </label>
              {apiLoading && !classAssessments.length ? (
                <div className="text-sm text-slate-500 flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Fetching
                  assessments...
                </div>
              ) : classAssessments.length === 0 ? (
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                  No assessments configured for this subject yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classAssessments.map((a) => {
                    const on = assessmentId === a.id;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setAssessmentId(a.id);
                          setGrades({});
                        }}
                        className={`p-3 rounded-xl text-left border-2 transition-all ${on ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-transparent hover:border-slate-300"}`}
                      >
                        <p
                          className={`text-sm font-semibold ${on ? "text-indigo-600" : "text-slate-700"}`}
                        >
                          {a.name}
                        </p>
                        <p
                          className={`text-xs mt-0.5 ${on ? "text-indigo-600" : "text-slate-400"}`}
                        >
                          Max {a.max_score} marks
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              disabled={!assessmentId || classAssessments.length === 0}
              onClick={() => {
                setGrades({});
                setStep("enter");
              }}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enter Grades <ChevronRight size={15} />
            </button>
          </div>
        </>
      )}

      {activeTab === "grading" && step === "enter" && currentAssessment && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-xl border border-slate-200">
            <button
              onClick={() => setStep("select")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Change selection
            </button>
            <span className="text-slate-300">·</span>
            <span className="text-sm font-medium text-slate-700">
              {uniqueClasses.find((c) => c.class_id === classId)?.class_name} ·{" "}
              {
                subjectsForClass.find((s) => s.subject_id === subjectId)
                  ?.subject_name
              }{" "}
              · {currentAssessment.name}
            </span>
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Max {currentAssessment.max_score} marks / student
            </span>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <FileText size={16} className="text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-900">
              Enter the {currentAssessment.name} score for each student in the
              table below.
            </p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            {apiLoading && !rosterData ? (
              <div className="p-10 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
                Loading student roster...
              </div>
            ) : rosterData?.students.length === 0 ? (
              <div className="p-10 text-center text-slate-500">
                No students enrolled in this class.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Student
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Score / {currentAssessment.max_score}
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      %
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Grade
                    </th>
                    <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rosterData?.students.map((student) => {
                    const val = grades[student.student_id];
                    const pct =
                      val !== "" && val !== undefined
                        ? Math.round(
                            (Number(val) / currentAssessment.max_score) * 100,
                          )
                        : null;
                    const gs = pct !== null ? getNigerianGradeShort(pct) : null;
                    return (
                      <tr
                        key={student.student_id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-slate-900">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {student.admission_number}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <input
                            type="number"
                            min={0}
                            max={currentAssessment.max_score}
                            value={val ?? ""}
                            onChange={(e) =>
                              updateGrade(student.student_id, e.target.value)
                            }
                            placeholder="-"
                            className="w-20 text-center px-2 py-1.5 rounded-lg text-sm font-bold border-2 border-slate-200 outline-none text-slate-900 focus:border-indigo-600 focus:ring-0 transition-colors"
                          />
                        </td>
                        <td className="px-5 py-3 text-center">
                          {pct !== null ? (
                            <span
                              className={`text-sm font-semibold ${pct >= 50 ? "text-emerald-500" : "text-red-500"}`}
                            >
                              {pct}%
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {gs ? (
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${gs.bg} ${gs.color}`}
                            >
                              {gs.l}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span
                            className={`text-xs font-semibold ${pct !== null ? (pct >= 50 ? "text-emerald-500" : "text-red-500") : "text-slate-300"}`}
                          >
                            {pct !== null ? (pct >= 50 ? "Pass" : "Fail") : ""}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {allEntered && avg !== null && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Class Average",
                  value: `${avg}%`,
                  color: avg >= 50 ? "text-emerald-600" : "text-red-600",
                  bg:
                    avg >= 50
                      ? "bg-emerald-50 border-emerald-100"
                      : "bg-red-50 border-red-100",
                },
                {
                  label: "Highest Score",
                  value: String(highest),
                  color: "text-indigo-600",
                  bg: "bg-indigo-50 border-indigo-100",
                },
                {
                  label: "Passes (≥ 50%)",
                  value: String(passCount),
                  color: "text-indigo-700",
                  bg: "bg-indigo-50 border-indigo-100",
                },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className={`text-center p-4 rounded-xl border ${bg}`}
                >
                  <p className={`font-bold text-2xl ${color}`}>{value}</p>
                  <p
                    className={`text-xs font-semibold mt-0.5 opacity-80 ${color}`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {savedMsg && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 animate-in fade-in zoom-in duration-200">
              <CheckCircle className="text-emerald-500" size={20} />
              <p className="text-sm font-medium text-emerald-800">{savedMsg}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving || !allEntered}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                <CheckCircle size={16} />
              )}
              Submit to Admin
            </button>
          </div>
        </div>
      )}

      {activeTab === "report_cards" && <ReportCardsTab />}
    </div>
  );
}
