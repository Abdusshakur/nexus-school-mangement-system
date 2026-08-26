import apiClient from "./client";

export interface AttendanceRecordPayload {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  remarks?: string;
}

export interface AttendanceSubmitRequest {
  class_id: string;
  attendance_date: string;
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
