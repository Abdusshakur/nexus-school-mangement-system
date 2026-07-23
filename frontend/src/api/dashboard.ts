import { apiFetch } from "./client";

export interface AttendanceTodaySummary {
  present: number;
  total: number;
  percentage: number;
}

export interface DashboardSummaryResponse {
  students: number;
  parents: number;
  teachers: number;
  active_announcements: number;
  attendance_today: AttendanceTodaySummary;
}

export interface DailyAttendance {
  day: string;
  date: string;
  present: number;
  absent: number;
  late: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
  return apiFetch("/dashboard/summary", { method: "GET" });
};

export const fetchAttendanceTrends = async (): Promise<DailyAttendance[]> => {
  return apiFetch("/dashboard/attendance-trends", { method: "GET" });
};
