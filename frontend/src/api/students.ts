import { API_BASE, getAuthHeaders } from "./client";
import { useAuthStore } from "../store/auth";

export interface StudentCreatePayload {
  email: string;
  password?: string;
  admission_number: string;
  class_name: string;
}

export interface StudentResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  admission_number: string;
  class_name: string;
  created_at: string;
}

export interface PaginatedStudentsResponse {
  items: StudentResponse[];
  total: number;
}

// POST: Saves new student profile to the db
export const createStudent = async (
  payload: StudentCreatePayload,
): Promise<StudentResponse> => {
  const response = await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Session expired or unauthorized. Please log in again.");
    }
    throw new Error(
      (data as { detail?: string }).detail ??
      "Failed to provision student profile.",
    );
  }

  return data;
};

// GET: Fetch student profile from the db
export const fetchStudentsList = async (
  search?: string,
  className?: string,
  name?: string,
): Promise<StudentResponse[]> => {
  const url = new URL(`${API_BASE}/students`);
  if (search) url.searchParams.append("search", search);
  if (className && className !== "All")
    url.searchParams.append("class", className);
  if (name) url.searchParams.append("name", name);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Session expired or unauthorized. Please log in again.");
    }
    throw new Error("Could not find student profile.");
  }

  return response.json();
};

export function formatClassName(name?: string): string {
  if (!name) return "SS 1";
  const clean = name.trim();
  const lower = clean.toLowerCase().replace(/[\s-]/g, "");

  if (lower === "jss1") return "JSS 1";
  if (lower === "jss2") return "JSS 2";
  if (lower === "jss3") return "JSS 3";
  if (lower === "ss1") return "SS 1";
  if (lower === "ss2") return "SS 2";
  if (lower === "ss3") return "SS 3";

  return clean;
}
