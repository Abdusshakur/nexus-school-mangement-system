import apiClient from "./client";
import { type ParentResponse } from "./parents";
import { type TermResultDetailResponse } from "./adminResults";


export interface LinkedStudentResponse {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  class_name: string;
  relationship_type?: string;
}

export interface ParentAttendanceResponse {
  id: string;
  student_id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE";
  notes?: string;
}

//  Fetch the logged-in parent's profile

export const fetchMyParentProfile = async (): Promise<ParentResponse> => {
  return apiClient.get("/parents/me");
};


// Fetch all students linked to the logged-in parent

export const fetchMyChildren = async (): Promise<LinkedStudentResponse[]> => {
  return apiClient.get("/parents/me/children");
};


// Fetch published results for a specific child

export const fetchMyChildResults = async (studentId: string): Promise<TermResultDetailResponse[]> => {
  return apiClient.get(`/parents/me/children/${studentId}/results`);
};


//  Fetch attendance for a specific child

export const fetchMyChildAttendance = async (studentId: string): Promise<ParentAttendanceResponse[]> => {
  return apiClient.get(`/parents/me/children/${studentId}/attendance`);
};
