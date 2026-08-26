import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Assignment, Submission } from "../pages/teacher/assignments/data";
import {
  DEFAULT_ASSIGNMENTS,
  DEFAULT_SUBMISSIONS,
} from "../pages/teacher/assignments/data";

interface AssignmentState {
  assignments: Assignment[];
  submissions: Submission[];

  addAssignment: (
    as: Omit<Assignment, "id" | "submittedCount" | "gradedCount">,
  ) => void;
  gradeSubmission: (
    submissionId: string,
    grade: number,
    feedback: string,
  ) => void;
}

export const useAssignmentStore = create<AssignmentState>()(
  persist(
    (set) => ({
      assignments: DEFAULT_ASSIGNMENTS,
      submissions: DEFAULT_SUBMISSIONS,

      addAssignment: (as) =>
        set((state) => {
          const newAs: Assignment = {
            id: "AS-" + Date.now(),
            ...as,
            submittedCount: 0,
            gradedCount: 0,
          };
          return {
            assignments: [...state.assignments, newAs],
          };
        }),

      gradeSubmission: (submissionId, grade, feedback) =>
        set((state) => {
          let submissionWasGraded = false;
          let relatedAssignmentId = "";

          const updatedSubs = state.submissions.map((sub) => {
            if (sub.id === submissionId) {
              submissionWasGraded = sub.status === "graded";
              relatedAssignmentId = sub.assignmentId;
              return {
                ...sub,
                grade,
                feedback,
                status: "graded" as const,
              };
            }
            return sub;
          });

          const updatedAs = state.assignments.map((as) => {
            if (as.id === relatedAssignmentId && !submissionWasGraded) {
              return {
                ...as,
                gradedCount: as.gradedCount + 1,
              };
            }
            return as;
          });

          return {
            submissions: updatedSubs,
            assignments: updatedAs,
          };
        }),
    }),
    {
      name: "nexus_assignments_store",
    },
  ),
);
