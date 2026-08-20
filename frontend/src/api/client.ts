
import axios from "axios";
import { useAuthStore } from "../store/auth";
import { toast } from "sonner";

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || "";

export const API_BASE = RAW_BASE.includes("/api/v1")
  ? RAW_BASE
  : `${RAW_BASE.replace(/\/$/, "")}/api/v1`;

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    return response.status === 204 ? null : response.data;
  },
  (error) => {
    let errorMsg = "An error occurred";

    if (error.response) {
      const data = error.response.data;
      const backendMessage = data?.detail || data?.message;
      const status = error.response.status;

      switch (status) {
        case 400:
          errorMsg = typeof backendMessage === "string" ? backendMessage : "The information provided is invalid. Please check your inputs and try again.";
          break;
        case 401:
          useAuthStore.getState().logout();
          errorMsg = "Your session has expired. Please log in again.";
          toast.error(errorMsg);
          window.location.href = "/login";
          return Promise.reject(new Error(errorMsg)); // Fast exit
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
          if (Array.isArray(data?.detail)) {
            const firstErr = data.detail[0];
            const field = firstErr?.loc?.length > 1 ? firstErr.loc[1] : "Input";
            if (firstErr?.msg?.includes("valid email address")) {
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
          errorMsg = typeof backendMessage === "string" ? backendMessage : "An unexpected error occurred. Please try again.";
      }
    } else {
      errorMsg = error.message || "A network error occurred. Please try again.";
    }

    if (errorMsg !== "Session expired or unauthorized.") {
      toast.error(errorMsg);
    }
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;
