import { apiFetch } from "./client";

export interface AssignedClassItem {
  id: string;
  name: string;
}

export interface AssignedSubjectItem {
  id: string;
  name: string;
}

export interface TeacherCreatePayload {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  address: string;
  department: string;
  qualification: string;
}

export interface TeacherCreateResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  department: string;
  qualification: string;
  address: string;
  created_at: string;
}

export interface TeacherProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  gender?: string;
  address?: string;
  department?: string;
  qualification?: string;
}

export interface TeacherDetailResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  gender: string;
  department: string;
  qualification: string;
  address: string;
  assigned_classes: AssignedClassItem[];
  assigned_subjects: AssignedSubjectItem[];
  created_at: string;
}

export const fetchTeachersList = async (): Promise<TeacherCreateResponse[]> => {
  return apiFetch("/teachers", { method: "GET" });
};

export const fetchTeacherById = async (id: string): Promise<TeacherDetailResponse> => {
  return apiFetch(`/teachers/${id}`, { method: "GET" });
};

export const createTeacher = async (
  payload: TeacherCreatePayload
): Promise<TeacherCreateResponse> => {
  return apiFetch("/teachers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateTeacherProfile = async (
  id: string,
  payload: TeacherProfileUpdatePayload
): Promise<any> => {
  return apiFetch(`/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const assignTeacherClasses = async (
  id: string,
  classIds: string[]
): Promise<any> => {
  return apiFetch(`/teachers/${id}/classes`, {
    method: "PUT",
    body: JSON.stringify({ class_ids: classIds }),
  });
};

export const assignTeacherSubjects = async (
  id: string,
  subjectIds: string[]
): Promise<any> => {
  return apiFetch(`/teachers/${id}/subjects`, {
    method: "PUT",
    body: JSON.stringify({ subject_ids: subjectIds }),
  });
};
