import React, { useState, } from "react";
import { CheckCircle, Clock, Save, AlertCircle } from "lucide-react";
import { type Assignment, type Submission } from "./data";

interface Props {
  activeAssignment: Assignment | null;
  submissions: Submission[];
  onGradeSubmit: (submissionId: string, grade: number, feedback: string) => void;
}

export function GradeSubmissions({ activeAssignment, submissions, onGradeSubmit }: Props) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number | "">("");
  const [feedbackText, setFeedbackText] = useState("");

  if (!activeAssignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
        <h4 className="text-slate-700 font-bold text-sm">No assignment selected</h4>
        <p className="text-slate-400 text-xs mt-1">Select an active coursework card on the left to review student submissions and grade.</p>
      </div>
    );
  }

  const activeSubmissions = submissions.filter((s) => s.assignmentId === activeAssignment.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || gradeScore === "") return;

    onGradeSubmit(selectedSubmission.id, Number(gradeScore), feedbackText);

    // Update local copy of submission state for immediate UI feedback on next click
    const nextSub = { ...selectedSubmission, grade: Number(gradeScore), feedback: feedbackText, status: "graded" as const };
    setSelectedSubmission(nextSub);
    setGradeScore("");
    setFeedbackText("");
    setSelectedSubmission(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-extrabold text-slate-900 text-base">{activeAssignment.title}</h3>
        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">{activeAssignment.class}</p>
      </div>

      {/* Roster list */}
      <div>
        <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3">Submissions</h4>
        <div className="space-y-2">
          {activeSubmissions.map((sub) => (
            <div
              key={sub.id}
              onClick={() => {
                setSelectedSubmission(sub);
                setGradeScore(sub.grade !== undefined ? sub.grade : "");
                setFeedbackText(sub.feedback || "");
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${selectedSubmission?.id === sub.id
                ? "border-indigo-500 bg-indigo-50/20"
                : sub.status === "graded"
                  ? "border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                  : "border-slate-200 hover:bg-slate-50"
                }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-slate-800 text-sm font-extrabold">{sub.studentName}</span>
                {sub.status === "graded" ? (
                  <span className="text-indigo-600 font-bold text-xs flex items-center gap-0.5">
                    <CheckCircle size={12} /> {sub.grade}/{activeAssignment.maxPoints}
                  </span>
                ) : (
                  <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-0.5 animate-pulse">
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[10px] font-medium mt-1">Submitted: {sub.submissionDate}</p>
            </div>
          ))}

          {activeSubmissions.length === 0 && (
            <p className="text-slate-400 text-xs py-4 text-center">No submissions yet for this newly added task.</p>
          )}
        </div>
      </div>

      {/* Active submission grading box */}
      {selectedSubmission && (
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Submission Content</p>
            <p className="text-slate-700 text-sm leading-relaxed mt-1.5 italic">"{selectedSubmission.content}"</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider">Assigned Score</label>
                <span className="text-slate-400 text-xs">Max points: {activeAssignment.maxPoints}</span>
              </div>
              <input
                type="number"
                value={gradeScore}
                onChange={(e) => setGradeScore(e.target.value === "" ? "" : Number(e.target.value))}
                min={0}
                max={activeAssignment.maxPoints}
                placeholder={`0 - ${activeAssignment.maxPoints}`}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">Instructor Feedback</label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Great attempt! Please address errors..."
                rows={3}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              <Save size={15} /> Save Grade & Feedback
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
