import type { LoginResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/api/v1/auth/login`, {
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
