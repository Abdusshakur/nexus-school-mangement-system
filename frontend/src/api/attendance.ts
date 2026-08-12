import { apiFetch } from "./client";

export interface SingleStudentAttendancePayload {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "LATE";
}

export interface BulkAttendanceCreatePayload {
  attendance_date: string;
  class_name: string;
  records: SingleStudentAttendancePayload[];
}

export interface AttendanceResponse {
  message: string;
  records_processed: number;
}

export const submitBulkAttendance = async (
  payload: BulkAttendanceCreatePayload
): Promise<AttendanceResponse> => {
  return apiFetch("/attendance/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
