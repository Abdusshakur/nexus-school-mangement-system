import client from "./client";

export interface TermResultResponse {
  id: string;
  student_id: string;
  student_name: string;
  admission_number: string;
  class_name: string;
  academic_session_name: string;
  academic_term_name: string;
  total_score: number;
  average_score: number;
  grade: string;
  status: "DRAFT" | "PUBLISHED" | "LOCKED";
}

export interface SubjectResultResponse {
  id: string;
  subject_name: string;
  ca_score?: number;
  exam_score?: number;
  total_score: number;
  percentage: number;
  grade: string;
}

export interface TermResultDetailResponse {
  term_result: TermResultResponse;
  subject_results: SubjectResultResponse[];
}


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
    return client.get("/results/submissions");
  },

  // Get details of all student scores for a specific submission
  fetchSubmissionDetails: async (submissionId: string): Promise<SubmissionDetailsResponse> => {
    return client.get(`/results/submissions/${submissionId}`);
  },

  // Approve score submission
  approveSubmission: async (submissionId: string): Promise<ScoreSubmission> => {
    return client.post(`/results/submissions/${submissionId}/approve`);
  },

  // Reject score submission
  rejectSubmission: async (submissionId: string, reason: string): Promise<ScoreSubmission> => {
    return client.post(`/results/submissions/${submissionId}/reject`, {
      reason,
    });
  },

  getTermPublicationStatus: async (
    termId: string,
  ): Promise<{ status: "DRAFT" | "PUBLISHED" | "LOCKED" }> => {
    try {
      const response = await client.get(`/results/terms/${termId}/publication-status`);
      return response as any;
    } catch (e: any) {
      if (e?.response?.status === 404 || e?.message?.includes("404")) {
        return { status: "DRAFT" };
      }
      return { status: "DRAFT" };
    }
  },

  publishTermResults: async (
    termId: string,
  ): Promise<{ message: string }> => {
    return client.post(`/results/terms/${termId}/publish`);
  },

  lockTermResults: async (
    termId: string,
  ): Promise<{ message: string }> => {
    return client.post(`/results/terms/${termId}/lock`);
  },

  getClassTermResults: async (
    classId: string,
    termId: string,
  ): Promise<TermResultDetailResponse[]> => {
    return client.get(`/results/classes/${classId}/terms/${termId}`);
  },
};

export async function fetchStudentResults(
  studentId: string
): Promise<TermResultDetailResponse[]> {
  const response = await client.get(`/results/students/${studentId}`);
  return response as unknown as TermResultDetailResponse[];
}
