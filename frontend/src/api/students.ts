import { apiFetch } from "./client";

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
  gender?: string;
  address?: string;
  phone_number?: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
}

export interface PaginatedStudentsResponse {
  items: StudentResponse[];
  total: number;
}

// POST: Saves new student profile to the db
export const createStudent = async (
  payload: StudentCreatePayload,
): Promise<StudentResponse> => {
  return apiFetch("/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// GET: Fetch student profile from the db
export const fetchStudentsList = async (
  search?: string,
  className?: string,
  name?: string,
): Promise<StudentResponse[]> => {
  let path = "/students";
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (className && className !== "All") params.append("class", className);
  if (name) params.append("name", name);

  const query = params.toString();
  if (query) {
    path += `?${query}`;
  }

  return apiFetch(path, { method: "GET" });
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
