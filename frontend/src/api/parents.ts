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

export interface ParentCreatePayload {
  email: string;
  password?: string;
  phone_number: string;
}

export interface RelationshipCreatePayload {
  parent_id: string;
  student_id: string;
  relationship_type: string;
}

export interface RelationshipResponse {
  parent_id: string;
  student_id: string;
  relationship_type?: string;
  message: string;
}

export const fetchParentsList = async (): Promise<ParentResponse[]> => {
  return apiFetch("/parents", { method: "GET" });
};

export const createParent = async (
  payload: ParentCreatePayload
): Promise<ParentResponse> => {
  const data = {
    email: payload.email,
    password: payload.password || "WelcomeNexus2026!",
    phone_number: payload.phone_number,
  };
  return apiFetch("/parents", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const linkParentToStudent = async (
  payload: RelationshipCreatePayload
): Promise<RelationshipResponse> => {
  return apiFetch("/relationships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
