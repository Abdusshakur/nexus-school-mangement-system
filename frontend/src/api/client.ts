import { useAuthStore } from "../store/auth";
import { toast } from "sonner";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "";

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
      let errorMsg = "An error occurred";
      const backendMessage = data.detail || data.message;

      switch (response.status) {
        case 400:
          errorMsg = typeof backendMessage === "string" ? backendMessage : "The information provided is invalid. Please check your inputs and try again.";
          break;
        case 401:
          useAuthStore.getState().logout();
          errorMsg = "Your session has expired. Please log in again.";
          toast.error(errorMsg);
          window.location.href = "/login";
          throw new Error(errorMsg);
        case 403:
          errorMsg = "You do not have permission to perform this action.";
          break;
        case 404:
          errorMsg = "The requested record could not be found. It may have been deleted.";
          break;
        case 409:
          errorMsg = typeof backendMessage === "string" ? backendMessage : "This record already exists in the system.";
          break;
        case 422:
          if (Array.isArray(data.detail)) {
            const firstErr = data.detail[0];
            const field = firstErr.loc?.length > 1 ? firstErr.loc[1] : "Input";
            if (firstErr.msg.includes("valid email address")) {
              errorMsg = "Invalid email address.";
            } else {
              errorMsg = `Invalid format provided for ${field}.`;
            }
          } else {
            errorMsg = "The submitted data is invalid.";
          }
          break;
        case 500:
          errorMsg = "Internal server error. Please try again later.";
          break;
        case 502:
        case 503:
        case 504:
          errorMsg = "The system is currently undergoing maintenance. Please try again in a few minutes.";
          break;
        default:
          errorMsg = typeof backendMessage === "string" ? backendMessage : `Request failed with status ${response.status}`;
      }

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
