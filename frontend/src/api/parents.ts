import { API_BASE, getAuthHeaders } from "./client";
import { useAuthStore } from "../store/auth";

export interface ParentResponse {
  id: string;
  user_id: string;
  email: string;
  phone_number: string;
  created_at: string;
}

export const fetchParentsList = async (): Promise<ParentResponse[]> => {
  const response = await fetch(`${API_BASE}/parents`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error("Session expired or unauthorized. Please log in again.");
    }
    throw new Error("Failed to fetch parents list.");
  }

  return response.json();
};
