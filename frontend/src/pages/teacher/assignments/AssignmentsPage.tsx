import { useState } from "react";
import { Plus } from "lucide-react";
import type { Assignment } from "./data";
import { useAssignmentStore } from "../../../store/assignment.store";
import { CreateAssignment } from "./CreateAssignmentPage";
import { AssignmentList } from "./AssignmentList";
import { GradeSubmissions } from "./GradeSubmissions";

export default function TeacherAssignments() {
  const { assignments, submissions, addAssignment, gradeSubmission } =
    useAssignmentStore();

  const [isCreating, setIsCreating] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(
    null,
  );

  const handlePostAssignment = (
    as: Omit<Assignment, "id" | "submittedCount" | "gradedCount">,
  ) => {
    addAssignment(as);
    setIsCreating(false);
  };

  const handleGradeSubmit = (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => {
    if (!activeAssignment) return;
    gradeSubmission(submissionId, grade, feedback);

    const refreshedActive = useAssignmentStore
      .getState()
      .assignments.find((a) => a.id === activeAssignment.id);
    if (refreshedActive) {
      setActiveAssignment(refreshedActive);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto">
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-xl sm:text-2xl font-extrabold tracking-tight">
            Assignments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Publish coursework and grade student submissions
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(!isCreating);
            setActiveAssignment(null);
          }}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} /> {isCreating ? "View List" : "New Assignment"}
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 space-y-6">
          {isCreating ? (
            <CreateAssignment
              onPost={handlePostAssignment}
              onCancel={() => setIsCreating(false)}
            />
          ) : (
            <AssignmentList
              assignments={assignments}
              activeAssignment={activeAssignment}
              onSelectAssignment={(a) => setActiveAssignment(a)}
            />
          )}
        </div>

        {/*  Submission Grading */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit">
          <GradeSubmissions
            key={activeAssignment?.id || "empty"}
            activeAssignment={activeAssignment}
            submissions={submissions}
            onGradeSubmit={handleGradeSubmit}
          />
        </div>
      </main>
    </div>
  );
}
