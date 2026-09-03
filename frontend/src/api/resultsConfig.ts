import apiClient from "./client";

export interface AssessmentSchemeResponse {
  id: string;
  school_id: string;
  academic_session_id: string;
  academic_term_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  academic_session_name: string;
  academic_term_name: string;
  name: string;
  total_weight: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  version: number;
  created_at: string;
  updated_at: string;
}

export interface AssessmentSchemeCreate {
  academic_session_id: string;
  academic_term_id: string;
  class_id?: string | null;
  subject_id?: string | null;
  name: string;
  total_weight: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

export interface AssessmentSchemeUpdate {
  name?: string;
  total_weight?: number;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
}

export async function fetchSchemes(): Promise<AssessmentSchemeResponse[]> {
  return apiClient.get("/results/schemes");
}

export async function createScheme(payload: AssessmentSchemeCreate): Promise<AssessmentSchemeResponse> {
  return apiClient.post("/results/schemes", payload);
}

export async function getScheme(schemeId: string): Promise<AssessmentSchemeResponse> {
  return apiClient.get(`/results/schemes/${schemeId}`);
}

export async function updateScheme(schemeId: string, payload: AssessmentSchemeUpdate): Promise<AssessmentSchemeResponse> {
  return apiClient.patch(`/results/schemes/${schemeId}`, payload);
}

// ==========================================
// ASSESSMENTS (COMPONENTS OF SCHEME)
// ==========================================
export interface AssessmentComponentResponse {
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

export interface AssessmentComponentCreate {
  name: string;
  type: string;
  max_score: number;
  weight: number;
  sequence: number;
  is_required: boolean;
  status: string;
}

export interface AssessmentComponentUpdate {
  name?: string;
  type?: string;
  max_score?: number;
  weight?: number;
  sequence?: number;
  is_required?: boolean;
  status?: string;
}

export async function fetchSchemeAssessments(schemeId: string): Promise<AssessmentComponentResponse[]> {
  return apiClient.get(`/results/schemes/${schemeId}/assessments`);
}

export async function addAssessmentComponent(schemeId: string, payload: AssessmentComponentCreate): Promise<AssessmentComponentResponse> {
  return apiClient.post(`/results/schemes/${schemeId}/assessments`, payload);
}

export async function updateAssessmentComponent(assessmentId: string, payload: AssessmentComponentUpdate): Promise<AssessmentComponentResponse> {
  return apiClient.patch(`/results/assessments/${assessmentId}`, payload);
}

// ==========================================
// GRADING SCALES
// ==========================================
export interface GradingScaleResponse {
  id: string;
  school_id: string;
  name: string;
  academic_session_id: string;
  academic_term_id: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GradingScaleCreate {
  name: string;
  academic_session_id: string;
  academic_term_id: string;
  version?: number;
  is_active?: boolean;
}

export interface GradingScaleUpdate {
  name?: string;
  is_active?: boolean;
}

export async function fetchGradingScales(): Promise<GradingScaleResponse[]> {
  return apiClient.get("/results/grading-scales");
}

export async function createGradingScale(payload: GradingScaleCreate): Promise<GradingScaleResponse> {
  return apiClient.post("/results/grading-scales", payload);
}

export async function updateGradingScale(scaleId: string, payload: GradingScaleUpdate): Promise<GradingScaleResponse> {
  return apiClient.patch(`/results/grading-scales/${scaleId}`, payload);
}

// ==========================================
// GRADING RULES
// ==========================================
export interface GradingRuleResponse {
  id: string;
  grading_scale_id: string;
  grade: string;
  minimum_percentage: number;
  maximum_percentage: number;
  remark: string;
}

export interface GradingRuleCreate {
  grade: string;
  minimum_percentage: number;
  maximum_percentage: number;
  remark: string;
}

export interface GradingRuleUpdate {
  grade?: string;
  minimum_percentage?: number;
  maximum_percentage?: number;
  remark?: string;
}

export async function fetchGradingRules(scaleId: string): Promise<GradingRuleResponse[]> {
  return apiClient.get(`/results/grading-scales/${scaleId}/rules`);
}

export async function addGradingRule(scaleId: string, payload: GradingRuleCreate): Promise<GradingRuleResponse> {
  return apiClient.post(`/results/grading-scales/${scaleId}/rules`, payload);
}

export async function updateGradingRule(ruleId: string, payload: GradingRuleUpdate): Promise<GradingRuleResponse> {
  return apiClient.patch(`/results/grading-rules/${ruleId}`, payload);
}
