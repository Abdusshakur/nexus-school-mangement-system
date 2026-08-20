import apiClient from "./client";

export interface AnnouncementCreatePayload {
  title: string;
  content: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  status: string;
  author_id: string;
  created_at: string;
  author_name?: string;
  author_role?: string;
}

export const fetchAnnouncements = async (
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" = "PUBLISHED",
): Promise<AnnouncementResponse[]> => {
  return apiClient.get(`/announcements/?status=${status}`);
};

export const createAnnouncement = async (
  payload: AnnouncementCreatePayload,
): Promise<AnnouncementResponse> => {
  return apiClient.post("/announcements", payload);
};
