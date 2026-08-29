import apiClient from "./client";

export interface ParentOnboardingDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  relationship_type?: string;
  is_primary_contact?: boolean;
  is_financial_sponsor?: boolean;
}

export interface LinkedParent {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  relationship_type: string;
}

export interface StudentCreatePayload {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone_number: string | null;
  class_id: string;
  parent?: ParentOnboardingDetails;
  parents?: ParentOnboardingDetails[];
}

export interface StudentResponse {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  admission_number: string;
  class_name: string;
  gender: string;
  date_of_birth: string;
  address: string;
  phone_number: string;
  created_at: string;
  parents?: LinkedParent[];
}


export interface PaginatedStudentsResponse {
  items: StudentResponse[];
  total: number;
}

// POST: Saves new student profile to the db
export const createStudent = async (
  payload: StudentCreatePayload,
): Promise<StudentResponse> => {
  return apiClient.post("/students", payload);
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

  return apiClient.get(path);
};

// GET: Fetch a single student's complete profile
export const fetchStudentById = async (
  id: string,
): Promise<StudentResponse> => {
  return apiClient.get(`/students/${id}`);
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

export const getStudentByAdmissionNumber = async (
  admissionNumber: string,
): Promise<StudentResponse> => {
  return apiClient.get(`/students/${encodeURIComponent(admissionNumber)}`);
};

export const updateStudentProfile = async (
  studentId: string,
  payload: Partial<StudentResponse>,
): Promise<StudentResponse> => {
  return apiClient.patch(`/students/${studentId}`, payload);
};

export async function bulkTransferStudents(payload: {
  student_ids: string[];
  class_id: string;
  session_id: string;
  term_id: string;
}): Promise<any> {
  const { default: apiClient } = await import('./client');
  return apiClient.post(`/students/bulk-transfer`, payload);
}
