import client from "./client";

export interface StudentScoreSubmission {
  student_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  score: number | null;
  score_status: "PRESENT" | "ABSENT" | "EXCUSED" | "MISSING";
  remarks: string | null;
}

export interface ScoreSubmission {
  id: string;
  assessment_id: string;
  school_id: string;
  academic_session_id: string;
  academic_term_id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  submitted_by: string;
  assessment_name: string;
  teacher_name: string;
  class_name: string;
  subject_name: string;
  academic_session_name: string;
  academic_term_name: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionDetailsResponse {
  assessment: {
    id: string;
    scheme_id: string;
    name: string;
    type: string;
    max_score: number;
    weight: number;
    sequence: number;
    is_required: boolean;
    status: string;
    created_at: string;
    updated_at: string;
  };
  submission: ScoreSubmission;
  students: StudentScoreSubmission[];
}

export const adminResultsApi = {
  // List all score submissions across the school
  fetchSubmissions: async (): Promise<ScoreSubmission[]> => {
    const response = await client.get("/results/submissions");
    return response.data;
  },

  // Get details (including all student scores) for a specific submission
  fetchSubmissionDetails: async (submissionId: string): Promise<SubmissionDetailsResponse> => {
    const response = await client.get(`/results/submissions/${submissionId}`);
    return response.data;
  },

  // Approve a score submission
  approveSubmission: async (submissionId: string): Promise<ScoreSubmission> => {
    const response = await client.post(`/results/submissions/${submissionId}/approve`);
    return response.data;
  },

  // Reject a score submission
  rejectSubmission: async (submissionId: string, reason: string): Promise<ScoreSubmission> => {
    const response = await client.post(`/results/submissions/${submissionId}/reject`, {
      reason,
    });
    return response.data;
  },
};
