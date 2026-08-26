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

export async function getCurrentUser(): Promise<any> {
  const { default: apiClient } = await import('./client');
  return apiClient.get('/auth/me');
}
