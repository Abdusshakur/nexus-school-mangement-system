import apiClient from "./client";

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
  return apiClient.get("/dashboard/summary");
};

export const fetchAttendanceTrends = async (): Promise<DailyAttendance[]> => {
  return apiClient.get("/dashboard/attendance-trends");
};
