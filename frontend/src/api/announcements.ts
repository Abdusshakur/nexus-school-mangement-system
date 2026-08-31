import apiClient from "./client";

export interface AnnouncementCreatePayload {
  title: string;
  content: string;
  category: string;
  audience: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface AnnouncementResponse {
  id: string;
  title: string;
  content: string;
  category: string;
  audience: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author_id: string;
  school_id: string;
  created_at: string;

  author_name?: string;
  author_role?: string;
}

export const fetchAnnouncements = async (
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  priority?: "LOW" | "MEDIUM" | "HIGH",
  audience?: string
): Promise<AnnouncementResponse[]> => {
  let path = "/announcements/";
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (priority) params.append("priority", priority);
  if (audience) params.append("audience", audience);
  const query = params.toString();
  if (query) {
    path += `?${query}`;
  }
  return apiClient.get(path);
};

export const createAnnouncement = async (
  payload: AnnouncementCreatePayload,
): Promise<AnnouncementResponse> => {
  return apiClient.post("/announcements/", payload);
};

export const updateAnnouncement = async (
  id: string,
  payload: Partial<AnnouncementCreatePayload>,
): Promise<AnnouncementResponse> => {
  return apiClient.patch(`/announcements/${id}`, payload);
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  return apiClient.delete(`/announcements/${id}`);
};
