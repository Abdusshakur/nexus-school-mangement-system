import { useAuthStore } from "../store/auth";
import { toast } from "sonner";

// Get whatever string the server environment has set
const RAW_BASE = import.meta.env.VITE_API_BASE_URL;

// Centralized safety wrapper: If missing the API prefix, append it automatically
export const API_BASE = RAW_BASE.includes("/api/v1")
  ? RAW_BASE
  : `${RAW_BASE.replace(/\/$/, "")}/api/v1`;

// Helper to get authorization headers uniformly across all requests
export const getAuthHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const apiFetch = async (
  path: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}/${path.replace(/^\//, "")}`;

  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401) {
        useAuthStore.getState().logout();
        toast.error("Session expired or unauthorized. Please log in again.");
        window.location.href = "/login";
        throw new Error("Session expired or unauthorized.");
      }

      const errorMsg =
        data.detail?.[0]?.msg ||
        data.detail ||
        `Request failed with status ${response.status}`;
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }

    return data;
  } catch (err: any) {
    if (err.message !== "Session expired or unauthorized.") {
      toast.error(err.message || "A network error occurred. Please try again.");
    }
    throw err;
  }
};
