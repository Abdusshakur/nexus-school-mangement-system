import { useAuthStore } from "../store/auth";

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
