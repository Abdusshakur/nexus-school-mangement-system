import apiClient from "./client";

export interface AcademicClass {
  id: string;
  name: string;
  form_teacher_id?: string;
  form_teacher_name?: string;
}

export interface AcademicSubject {
  id: string;
  name: string;
}

// CLASSES
export async function fetchClasses(): Promise<AcademicClass[]> {
  return apiClient.get("/academics/classes");
}

export async function createClass(payload: { name: string }): Promise<AcademicClass> {
  return apiClient.post("/academics/classes", payload);
}

export async function deleteClass(classId: string): Promise<void> {
  return apiClient.delete(`/academics/classes/${classId}`);
}

export async function updateClass(
  classId: string,
  payload: { name: string },
): Promise<any> {
  return apiClient.patch(`/academics/classes/${classId}`, payload);
}

export async function assignFormTeacher(
  classId: string,
  teacherId: string | null,
): Promise<any> {
  return apiClient.patch(`/academics/classes/${classId}/form-teacher`, {
    teacher_id: teacherId,
  });
}

// SUBJECTS
export async function fetchSubjects(): Promise<AcademicSubject[]> {
  return apiClient.get("/academics/subjects");
}

export async function createSubject(payload: { name: string }): Promise<AcademicSubject> {
  return apiClient.post("/academics/subjects", payload);
}

export async function updateSubject(
  subjectId: string,
  payload: { name: string },
): Promise<AcademicSubject> {
  return apiClient.patch(`/academics/subjects/${subjectId}`, payload);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  return apiClient.delete(`/academics/subjects/${subjectId}`);
}

// SESSIONS & TERMS
export interface AcademicSessionCreate {
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export interface AcademicTermCreate {
  session_id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
}

export async function createSession(payload: AcademicSessionCreate): Promise<any> {
  return apiClient.post("/academics/sessions", payload);
}

export async function createTerm(payload: AcademicTermCreate): Promise<any> {
  return apiClient.post(`/academics/sessions/${payload.session_id}/terms`, payload);
}

export async function activateSession(sessionId: string): Promise<any> {
  return apiClient.post(`/academics/sessions/${sessionId}/activate`);
}

export async function closeSession(sessionId: string): Promise<any> {
  return apiClient.post(`/academics/sessions/${sessionId}/close`);
}

export async function openTerm(termId: string): Promise<any> {
  return apiClient.post(`/academics/terms/${termId}/open`);
}

export async function fetchAllTermsAndSessions(): Promise<any> {
  return apiClient.get("/academics/terms/all");
}

export async function fetchActiveSummary(): Promise<any> {
  return apiClient.get("/academics/active-summary");
}
