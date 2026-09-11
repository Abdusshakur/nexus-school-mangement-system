import apiClient from "./client";

export interface AcademicClass {
  id: string;
  name: string;
  form_teacher_id?: string;
  form_teacher_name?: string;
  group_id?: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export interface GroupSubject {
  id: string;
  group_id: string;
  subject_id: string;
  subject_name: string;
  subject_code?: string;
  academic_session_id: string;
  academic_term_id: string;
  is_required: boolean;
  is_active: boolean;
}

export interface AcademicSubject {
  id: string;
  name: string;
}

// CLASSES
export async function fetchClasses(): Promise<AcademicClass[]> {
  return apiClient.get("/academics/classes");
}

export async function createClass(payload: {
  name: string;
  group_id?: string | null;
}): Promise<AcademicClass> {
  return apiClient.post("/academics/classes", payload);
}

export async function deleteClass(classId: string): Promise<void> {
  return apiClient.delete(`/academics/classes/${classId}`);
}

export async function updateClass(
  classId: string,
  payload: { name?: string; group_id?: string | null },
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

// CLASS GROUPS
export async function fetchClassGroups(): Promise<ClassGroup[]> {
  return apiClient.get("/academics/class-groups");
}

export async function createClassGroup(payload: { name: string; description?: string }): Promise<ClassGroup> {
  return apiClient.post("/academics/class-groups", payload);
}

export async function updateClassGroup(id: string, payload: { name?: string; description?: string }): Promise<ClassGroup> {
  return apiClient.patch(`/academics/class-groups/${id}`, payload);
}

// GROUP SUBJECTS
export async function fetchGroupSubjects(groupId: string, sessionId: string, termId: string): Promise<GroupSubject[]> {
  return apiClient.get(`/academics/class-groups/${groupId}/subjects?academic_session_id=${sessionId}&academic_term_id=${termId}`);
}

export async function assignGroupSubject(groupId: string, payload: { subject_id: string; academic_session_id: string; academic_term_id: string; is_required?: boolean }): Promise<GroupSubject> {
  return apiClient.post(`/academics/class-groups/${groupId}/subjects`, payload);
}

export async function deactivateGroupSubject(groupSubjectId: string): Promise<void> {
  return apiClient.delete(`/academics/group-subjects/${groupSubjectId}`);
}

// SUBJECTS
export async function fetchSubjects(): Promise<AcademicSubject[]> {
  return apiClient.get("/academics/subjects");
}

export async function createSubject(payload: {
  name: string;
}): Promise<AcademicSubject> {
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

export async function createSession(
  payload: AcademicSessionCreate,
): Promise<any> {
  return apiClient.post("/academics/sessions", payload);
}

export async function createTerm(payload: AcademicTermCreate): Promise<any> {
  return apiClient.post(
    `/academics/sessions/${payload.session_id}/terms`,
    payload,
  );
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
