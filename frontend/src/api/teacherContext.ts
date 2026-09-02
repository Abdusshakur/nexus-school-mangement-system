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

export interface TeacherAttendanceStatsResponse {
  period: string;
  attendance_rate: number;
  present_days: number;
  late_days: number;
  absent_days: number;
  total_working_days: number;
}

export const fetchMyAttendanceStats = async (year?: number, month?: number): Promise<TeacherAttendanceStatsResponse> => {
  const params: any = {};
  if (year) params.year = year;
  if (month) params.month = month;
  return apiClient.get("/teachers/me/attendance-stats", { params });
};

export interface TeacherAttendanceHistoryItem {
  attendance_date: string;
  status: string;
  is_late: boolean;
  check_in_at?: string;
  check_out_at?: string;
  check_in_method?: string;
  check_out_method?: string;
  duration_minutes?: number;
}

export const fetchMyAttendanceHistory = async (start_date?: string, end_date?: string): Promise<TeacherAttendanceHistoryItem[]> => {
  const params: any = {};
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  return apiClient.get("/teachers/me/history", { params });
};


