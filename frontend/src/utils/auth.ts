import type { LoginResponse } from "../types/auth";

export function saveAuth(data: LoginResponse): void {
  localStorage.setItem("token", data.access_token);
  localStorage.setItem("user_role", data.user.role);
  localStorage.setItem("user_id", data.user.id);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function logout(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_id");
}
