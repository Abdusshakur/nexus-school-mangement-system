import apiClient from "./client";

export interface AttendanceRecordPayload {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string;
}

export interface AttendanceSubmitRequest {
  class_id: string;
  date: string;
  records: AttendanceRecordPayload[];
}

export interface AttendanceSubmitResponse {
  message: string;
  session_id: string;
  records_processed: number;
}

export interface ClassAttendanceSummary {
  class_id: string;
  class_name: string;
  form_teacher_name: string;
  total_students: number;
  session_status: string;
  total_present: number;
  total_absent: number;
  total_late: number;
  attendance_rate_percentage: number;
}

export interface DailyAttendanceSummaryResponse {
  date: string;
  classes: ClassAttendanceSummary[];
}

export async function submitClassAttendance(payload: AttendanceSubmitRequest): Promise<AttendanceSubmitResponse> {
  return apiClient.post("/attendance/", payload);
}

export async function fetchDailyAttendanceSummary(date?: string): Promise<DailyAttendanceSummaryResponse> {
  const query = date ? `?date=${date}` : "";
  return apiClient.get(`/attendance/classes/summary${query}`);
}

export async function getMyAttendanceClasses(): Promise<any[]> {
  return apiClient.get("/attendance/my-classes");
}

export interface ClassRosterResponse {
  class_id: string;
  class_name: string;
  date: string;
  attendance_session_id: string;
  attendance_status: string;
  students: any[];
}

export async function getClassRosterForAttendance(classId: string, date: string): Promise<ClassRosterResponse> {
  return apiClient.get(`/attendance/classes/${classId}/students?date=${date}`);
}

export async function approveAttendance(sessionId: string, reason?: string): Promise<any> {
  return apiClient.post(`/attendance/${sessionId}/approve`, { reason });
}

export async function rejectAttendance(sessionId: string, reason?: string): Promise<any> {
  return apiClient.post(`/attendance/${sessionId}/reject`, { reason });
}

export async function reopenAttendance(sessionId: string, reason?: string): Promise<any> {
  return apiClient.post(`/attendance/${sessionId}/reopen`, { reason });
}

export async function teacherCheckIn(token: string): Promise<any> {
  return apiClient.post("/teachers/check-in", { token });
}

export async function teacherCheckOut(token: string): Promise<any> {
  return apiClient.post("/teachers/check-out", { token });
}

export async function getTeacherTodayStatus(): Promise<any> {
  return apiClient.get("/teachers/me/today");
}
