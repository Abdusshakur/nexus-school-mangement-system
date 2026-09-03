import axios from "axios";
import type { LoginResponse } from "../types/auth";
import { API_BASE } from "./client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  try {
    const response = await axios.post<LoginResponse>(`${API_BASE}/auth/login`, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail ?? "Incorrect email or password");
    }
    throw new Error("A network error occurred during login.");
  }
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
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      ...payload,
      role_name: "admin", // They are registering a school, so they get admin role
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.detail ?? "Registration failed");
    }
    throw new Error("A network error occurred during registration.");
  }
}

export async function getCurrentUser(): Promise<any> {
  const { default: apiClient } = await import('./client');
  return apiClient.get('/auth/me');
}
