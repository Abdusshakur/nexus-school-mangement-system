import apiClient from "./client";

export interface AssessmentRosterStudent {
  student_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  score?: number | null;
  score_status: "PRESENT" | "ABSENT" | "EXCUSED" | "MISSING";
  remarks?: string | null;
}

export interface AssessmentResponse {
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
}

export interface AssessmentSubmissionResponse {
  id: string;
  status: string;
  submitted_at: string | null;
}

export interface AssessmentRosterResponse {
  assessment: AssessmentResponse;
  submission: AssessmentSubmissionResponse | null;
  students: AssessmentRosterStudent[];
}

export interface AssessmentScoreInput {
  student_id: string;
  score?: number | null;
  score_status: "PRESENT" | "ABSENT" | "EXCUSED" | "MISSING";
  remarks?: string | null;
}

export interface AssessmentScoresRequest {
  scores: AssessmentScoreInput[];
}

// 1. List teacher assessments for a class/subject
export const fetchTeacherAssessments = async (classId: string, subjectId: string): Promise<AssessmentResponse[]> => {
  return apiClient.get(`/results/classes/${classId}/subjects/${subjectId}/assessments`);
};

// 2. Get assessment roster and existing scores
export const fetchAssessmentRoster = async (assessmentId: string): Promise<AssessmentRosterResponse> => {
  return apiClient.get(`/results/assessments/${assessmentId}/roster`);
};

// 3. Save assessment scores
export const saveAssessmentScores = async (assessmentId: string, payload: AssessmentScoresRequest): Promise<any> => {
  return apiClient.post(`/results/assessments/${assessmentId}/scores`, payload);
};

// 4. Submit scores for review
export const submitAssessmentScores = async (submissionId: string): Promise<any> => {
  return apiClient.post(`/results/submissions/${submissionId}/submit`);
};
