import { apiFetch } from "./client";

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
  return apiFetch("/academics/classes");
}

export async function createClass(payload: { name: string }): Promise<AcademicClass> {
  return apiFetch("/academics/classes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteClass(classId: string): Promise<void> {
  return apiFetch(`/academics/classes/${classId}`, {
    method: "DELETE",
  });
}

export async function assignFormTeacher(classId: string, teacherId: string | null): Promise<void> {
  return apiFetch(`/academics/classes/${classId}/form-teacher`, {
    method: "PATCH",
    body: JSON.stringify({ teacher_id: teacherId }),
  });
}

// SUBJECTS
export async function fetchSubjects(): Promise<AcademicSubject[]> {
  return apiFetch("/academics/subjects");
}

export async function createSubject(payload: { name: string }): Promise<AcademicSubject> {
  return apiFetch("/academics/subjects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteSubject(subjectId: string): Promise<void> {
  return apiFetch(`/academics/subjects/${subjectId}`, {
    method: "DELETE",
  });
}
