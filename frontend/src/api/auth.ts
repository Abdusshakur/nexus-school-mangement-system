import type { LoginResponse } from "../types/auth";

// Centralized base URL handler
import { API_BASE } from "./client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  // Mock login for teacher
  if (username === "teacher@nexus.com" && password === "12345") {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            access_token: "mock-teacher-token",
            token_type: "bearer",
            user: {
              id: "mock-teacher-id",
              role: "teacher",
            },
          }),
        500,
      ),
    );
  }
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
