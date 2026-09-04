import apiClient from "./client";

export interface TeacherAttendanceSettings {
  id?: string;
  school_id?: string;
  check_in_start: string;
  expected_check_in_time: string;
  late_threshold: string;
  check_in_end: string;
  check_out_start: string;
  expected_check_out_time: string;
  check_out_end: string;
  qr_rotation_seconds: number;
}

export interface TeacherAttendanceAdminItem {
  id: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  check_in_method?: string | null;
  check_out_method?: string | null;
  status: "NOT_STARTED" | "CHECKED_IN" | "CHECKED_OUT" | "MISSED_CHECK_IN" | "MISSED_CHECK_OUT" | "MANUAL_REVIEW" | "LATE";
  is_late: boolean;
  notes?: string;
}

export interface TeacherAttendanceCorrectionPayload {
  action: "CHECK_IN" | "CHECK_OUT";
  timestamp: string;
  reason: string;
}

export const fetchTeacherAttendanceSettings = async (): Promise<TeacherAttendanceSettings> => {
  return apiClient.get("/attendance/configuration");
};

export const updateTeacherAttendanceSettings = async (settings: TeacherAttendanceSettings, isUpdate: boolean = false): Promise<TeacherAttendanceSettings> => {
  if (isUpdate) {
    return apiClient.patch("/attendance/configuration", settings);
  } else {
    return apiClient.post("/attendance/configuration", settings);
  }
};

export const fetchTeacherAttendanceList = async (date?: string, teacher_id?: string, status?: string): Promise<TeacherAttendanceAdminItem[]> => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (teacher_id) params.append("teacher_id", teacher_id);
  if (status) params.append("status", status);
  
  return apiClient.get(`/teacher-attendance?${params.toString()}`);
};

export const correctTeacherAttendance = async (attendanceId: string, payload: TeacherAttendanceCorrectionPayload): Promise<TeacherAttendanceAdminItem> => {
  return apiClient.post(`/teacher-attendance/${attendanceId}/correction`, payload);
};

export const processMissedTeacherAttendance = async (date?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  
  return apiClient.post(`/teacher-attendance/missed/process?${params.toString()}`);
};
