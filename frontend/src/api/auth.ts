import type { LoginResponse } from "../types/auth";

// Centralized base URL handler
import { API_BASE } from "./client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {

  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  const data: LoginResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      (data as { detail?: string }).detail ?? "Incorrect email or password",
    );
  }

  return data;
}

export async function getCurrentUser(): Promise<any> {
  const { apiFetch } = await import('./client');
  return apiFetch('/auth/me', { method: 'GET' });
}
