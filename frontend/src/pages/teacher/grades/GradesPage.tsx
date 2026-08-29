import { useState } from "react";
import {
  CheckCircle,
  Save,
  FileText,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import { useGradeStore } from "../../../store/grade.store";
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

const MY_CLASSES = [
  {
    id: "SS2SCI",
    name: "SS 2 Science",
    subjects: ["Biology", "Basic Science"],
    students: [
      {
        id: "S001",
        name: "Amelia Johnson",
        initials: "AJ",
        color: "bg-indigo-500",
      },
      {
        id: "S003",
        name: "Sofia Rodriguez",
        initials: "SR",
        color: "bg-amber-500",
      },
      { id: "S007", name: "Layla Hassan", initials: "LH", color: "bg-sky-500" },
      {
        id: "S009",
        name: "Femi Adeyemi",
        initials: "FA",
        color: "bg-emerald-500",
      },
      {
        id: "S010",
        name: "Chidi Okafor",
        initials: "CO",
        color: "bg-purple-500",
      },
    ],
  },
  {
    id: "SS1SCI",
    name: "SS 1 Science",
    subjects: ["Biology", "Basic Science"],
    students: [
      {
        id: "S002",
        name: "Marcus Williams",
        initials: "MW",
        color: "bg-emerald-500",
      },
      {
        id: "S011",
        name: "Temi Balogun",
        initials: "TB",
        color: "bg-pink-500",
      },
      { id: "S012", name: "Emeka Eze", initials: "EE", color: "bg-indigo-600" },
      {
        id: "S016",
        name: "Yusuf Abubakar",
        initials: "YA",
        color: "bg-indigo-500",
      },
    ],
  },
  {
    id: "JSS3A",
    name: "JSS 3A",
    subjects: ["Basic Science"],
    students: [
      {
        id: "S006",
        name: "James Thompson",
        initials: "JT",
        color: "bg-pink-500",
      },
      {
        id: "S008",
        name: "Noah Anderson",
        initials: "NA",
        color: "bg-indigo-500",
      },
      { id: "S013", name: "Ngozi Ibe", initials: "NI", color: "bg-indigo-500" },
      {
        id: "S017",
        name: "Oluwaseun Oyelaran",
        initials: "OO",
        color: "bg-amber-500",
      },
    ],
  },
  {
    id: "SS3SCI",
    name: "SS 3 Science",
    subjects: ["Biology"],
    students: [
      {
        id: "S005",
        name: "Priya Patel",
        initials: "PP",
        color: "bg-purple-500",
      },
      {
        id: "S014",
        name: "Kolade Adebisi",
        initials: "KA",
        color: "bg-amber-500",
      },
      {
        id: "S015",
        name: "Aisha Mohammed",
        initials: "AM",
        color: "bg-red-500",
      },
    ],
  },
];

const SESSIONS = ["2025/2026", "2024/2025", "2023/2024"];
const TERMS = ["1st Term", "2nd Term", "3rd Term"];

const ASSESSMENT_TYPES = [
  { id: "ca1", label: "1st CA", max: 20 },
  { id: "ca2", label: "2nd CA", max: 20 },
  { id: "ca3", label: "3rd CA", max: 20 },
  { id: "mid", label: "Mid-Term Test", max: 20 },
  { id: "exam", label: "Exam", max: 60 },
];

type GradeMap = Record<string, number | "">;

export default function TeacherGrades() {
  const { gradeRecords, saveGrades } = useGradeStore();
  const [activeTab, setActiveTab] = useState<"grading" | "report_cards">("grading");
  const [step, setStep] = useState<"select" | "enter">("select");
  const [classId, setClassId] = useState("SS2SCI");
  const [subject, setSubject] = useState("Biology");
  const [session, setSession] = useState("2025/2026");
  const [term, setTerm] = useState("3rd Term");
  const [assessmentId, setAssessmentId] = useState("ca1");
  const [grades, setGrades] = useState<GradeMap>({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const cls = MY_CLASSES.find((c) => c.id === classId)!;
  const assessment = ASSESSMENT_TYPES.find((a) => a.id === assessmentId)!;

  const updateGrade = (studentId: string, val: string) => {
    const num =
      val === "" ? "" : Math.max(0, Math.min(assessment.max, Number(val)));
    setGrades((prev) => ({ ...prev, [studentId]: num }));
  };

  const allEntered = cls.students.every(
    (s) => grades[s.id] !== undefined && grades[s.id] !== "",
  );

  const numGrades = cls.students.map((s) => Number(grades[s.id] ?? 0));
  const avg = allEntered
    ? Math.round(numGrades.reduce((a, b) => a + b, 0) / numGrades.length)
    : null;
  const highest = allEntered ? Math.max(...numGrades) : null;
  const passCount = allEntered
    ? numGrades.filter((n) => (n / assessment.max) * 100 >= 50).length
    : null;

  const existingRecord = gradeRecords.find(
    (r) =>
      r.teacherId === "T001" &&
      r.classId === classId &&
      r.subject === subject &&
      r.term === term &&
      r.session === session,
  );

  const handleSave = (submit: boolean) => {
    setSaving(true);
    setTimeout(() => {
      saveGrades({
        teacherId: "T001",
        teacherName: "Mr. Ade Okafor",
        classId,
        className: cls.name,
        subject,
        term,
        session,
        submitted: submit,
        grades: cls.students.map((s) => ({
          studentId: s.id,
          studentName: s.name,
          ca1: assessmentId === "ca1" ? Number(grades[s.id] ?? 0) : 0,
          ca2: assessmentId === "ca2" ? Number(grades[s.id] ?? 0) : 0,
          exam: assessmentId === "exam" ? Number(grades[s.id] ?? 0) : 0,
        })),
      });
      setSaving(false);
      setSavedMsg(submit ? "Grades submitted successfully." : "Draft saved.");
      setTimeout(() => setSavedMsg(""), 3000);
    }, 700);
  };

  return (
    <div className="space-y-5 p-6 max-w-5xl ">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">Academics & Results</h1>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Class
                </label>
                <select
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setSubject(
                      MY_CLASSES.find((c) => c.id === e.target.value)!
                        .subjects[0],
                    );
                    setGrades({});
                  }}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {MY_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {cls.subjects.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Academic Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {SESSIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Term
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {TERMS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-700">
                Assessment Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ASSESSMENT_TYPES.map((a) => {
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
                        {a.label}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${on ? "text-indigo-600" : "text-slate-400"}`}
                      >
                        Max {a.max} marks
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {existingRecord && (
              <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-indigo-50">
                <AlertCircle size={14} className="text-indigo-500 shrink-0" />
                <p className="text-xs text-indigo-700">
                  A record already exists for this selection. Proceeding will
                  update it.
                </p>
              </div>
            )}

            <button
              onClick={() => {
                setGrades({});
                setStep("enter");
              }}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Enter Grades <ChevronRight size={15} />
            </button>
          </div>

          {gradeRecords.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-200">
              <h3 className="font-semibold mb-3 text-slate-900">
                Recent Grade Records
              </h3>
              <div className="space-y-2">
                {gradeRecords
                  .slice()
                  .reverse()
                  .slice(0, 5)
                  .map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {r.className} {r.subject}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.term} · {r.session} ·{" "}
                          {new Date(r.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${r.submitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}
                      >
                        {r.submitted ? "Submitted" : "Draft"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "grading" && step === "enter" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 flex-wrap bg-white p-3 rounded-xl border border-slate-200">
            <button
              onClick={() => setStep("select")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              ← Change selection
            </button>
            <span className="text-slate-300">·</span>
            <span className="text-sm font-medium text-slate-700">
              {cls.name} · {subject} · {assessment.label} · {term} {session}
            </span>
            <span className="ml-auto px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Max {assessment.max} marks / student
            </span>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <FileText size={16} className="text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-900">
              Enter the {assessment.label} score for each students in the table
              below.
            </p>
          </div>

          <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Student
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Score / {assessment.max}
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
                {cls.students.map((student) => {
                  const val = grades[student.id];
                  const pct =
                    val !== "" && val !== undefined
                      ? Math.round((Number(val) / assessment.max) * 100)
                      : null;
                  const gs = pct !== null ? getNigerianGradeShort(pct) : null;
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${student.color}`}
                          >
                            <span className="font-bold text-[11px]">
                              {student.initials}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900">
                            {student.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          max={assessment.max}
                          value={val ?? ""}
                          onChange={(e) =>
                            updateGrade(student.id, e.target.value)
                          }
                          placeholder=" "
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
                          <span className="text-slate-300"> </span>
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
                          <span className="text-slate-300"> </span>
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
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle size={18} className="text-emerald-500 shrink-0" />
              <p className="text-sm font-semibold text-emerald-800">
                {savedMsg}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={!allEntered || saving}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-colors ${allEntered ? "bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10" : "bg-slate-300 cursor-not-allowed"}`}
            >
              <CheckCircle size={16} /> Submit Record
            </button>
          </div>
          <p className="text-xs text-center font-medium text-slate-400">
            Save as draft to continue later. Submit only after all scores are
            verified from paper scripts.
          </p>
        </div>
      )}

      {activeTab === "report_cards" && <ReportCardsTab />}
    </div>
  );
}
