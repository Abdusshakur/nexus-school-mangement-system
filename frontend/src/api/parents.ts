import { apiFetch } from "./client";

export interface ParentChild {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

export interface ParentResponse {
  id: string;
  user_id: string;
  email: string;
  phone_number: string;
  created_at: string;
  children?: ParentChild[];
}

export const fetchParentsList = async (): Promise<ParentResponse[]> => {
  return apiFetch("/parents", { method: "GET" });
};
