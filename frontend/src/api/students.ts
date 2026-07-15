import { API_BASE, getAuthHeaders } from "./client";

export interface StudentCreatePayload {
  email: string;
  password?: string; // Optional on frontend if we auto-generate it
  admission_number: string;
  class_name: string;
}

export interface StudentResponse {
  id: string; // UUID
  user_id: string; // UUID
  email: string;
  admission_number: string;
  class_name: string;
  created_at: string;
}

export interface PaginatedStudentsResponse {
  items: StudentResponse[];
  total: number;
}

// POST: Save new student account profile to the DB
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
    throw new Error(
      (data as { detail?: string }).detail ??
        "Failed to provision student profile.",
    );
  }

  return data;
};

// GET: Fetch student registry from the database
export const fetchStudentsList = async (
  search?: string,
  className?: string,
): Promise<StudentResponse[]> => {
  const url = new URL(`${API_BASE}/students`);
  if (search) url.searchParams.append("search", search);
  if (className) url.searchParams.append("class", className);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Could not sync campus student registry.");
  }

  return response.json();
};
