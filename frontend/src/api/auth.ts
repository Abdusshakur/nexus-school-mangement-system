import type { LoginResponse } from "../types/auth";
import apiClient from "./client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  
  return apiClient.post<any, LoginResponse>("/auth/login", formData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

export async function registerSchoolAdmin(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  school_id: string; // From the user generated UUID
  phone_number?: string;
  school_name?: string;
  motto?: string;
  address?: string;
}): Promise<any> {
  return apiClient.post("/auth/register", {
    ...payload,
    role_name: "admin", // They are registering a school, so they get admin role
  });
}

export async function getCurrentUser(): Promise<any> {
  const { default: apiClient } = await import('./client');
  return apiClient.get('/auth/me');
}
