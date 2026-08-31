import apiClient from "./client";

export interface TeacherContextResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  phone_number: string;
  is_active: boolean;
}

export interface TeacherAssignmentContextResponse {
  assignment_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  status: string;
}

export interface TeacherStudentContextResponse {
  student_id: string;
  admission_number: string;
  first_name: string;
  last_name: string;
  gender: string;
  class_id: string;
  class_name: string;
}

export const fetchMyTeacherProfile = async (): Promise<TeacherContextResponse> => {
  return apiClient.get("/teachers/me");
};

export const fetchMyTeacherAssignments = async (): Promise<TeacherAssignmentContextResponse[]> => {
  return apiClient.get("/teachers/me/assignments");
};

export const fetchMyTeacherStudents = async (classId?: string): Promise<TeacherStudentContextResponse[]> => {
  const params = classId ? { class_id: classId } : {};
  return apiClient.get("/teachers/me/students", { params });
};
