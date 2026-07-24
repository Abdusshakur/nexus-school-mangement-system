import { apiFetch } from "./client";

export interface ParentChild {
  id: string;
  first_name: string;
  last_name: string;
  admission_number?: string;
  class_name: string;
  relationship_type?: string;
}

export interface ParentResponse {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number: string;
  created_at: string;
  students?: ParentChild[];
  children?: ParentChild[];
}

export interface ParentCreatePayload {
  first_name?: string;
  last_name?: string;
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

export const fetchParentsList = async (
  search?: string,
): Promise<ParentResponse[]> => {
  const path = search
    ? `/parents?search=${encodeURIComponent(search)}`
    : "/parents";
  return apiFetch(path, { method: "GET" });
};

export const fetchParentById = async (
  parentId: string,
): Promise<ParentResponse> => {
  return apiFetch(`/parents/${parentId}`, { method: "GET" });
};

export const searchParents = async (
  query: string,
): Promise<ParentResponse[]> => {
  return fetchParentsList(query);
};

export const createParent = async (
  payload: ParentCreatePayload,
): Promise<ParentResponse> => {
  const data = {
    first_name: payload.first_name,
    last_name: payload.last_name,
    email: payload.email,
    password: payload.password,
    phone_number: payload.phone_number,
  };
  return apiFetch("/parents", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const linkParentToStudent = async (
  payload: RelationshipCreatePayload,
): Promise<RelationshipResponse> => {
  return apiFetch("/relationships", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
