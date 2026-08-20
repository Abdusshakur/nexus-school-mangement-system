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

export async function assignFormTeacher(classId: string, teacherId: string | null): Promise<void> {
  return apiClient.patch(`/academics/classes/${classId}/form-teacher`, { teacher_id: teacherId });
}

// SUBJECTS
export async function fetchSubjects(): Promise<AcademicSubject[]> {
  return apiClient.get("/academics/subjects");
}

export async function createSubject(payload: { name: string }): Promise<AcademicSubject> {
  return apiClient.post("/academics/subjects", payload);
}

export async function deleteSubject(subjectId: string): Promise<void> {
  return apiClient.delete(`/academics/subjects/${subjectId}`);
}
