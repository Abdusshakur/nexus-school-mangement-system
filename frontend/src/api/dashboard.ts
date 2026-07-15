// 1. Get whatever string the server environment has set
import { API_BASE, getAuthHeaders } from "./client";

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

export const getDashboardSummary =
  async (): Promise<DashboardSummaryResponse> => {
    const response = await fetch(`${API_BASE}/dashboard/summary`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error("Failed to load school dashboard .");
    }

    return response.json();
  };
