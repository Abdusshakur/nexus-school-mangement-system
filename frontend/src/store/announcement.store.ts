import { create } from "zustand";
import {
  fetchAnnouncements,
  createAnnouncement,
  deleteAnnouncement as apiDeleteAnnouncement,
  updateAnnouncement as apiUpdateAnnouncement,
  type AnnouncementResponse,
} from "../api/announcements";

export interface StoreAnnouncement {
  id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  authorName: string;
  authorRole: string;
  date: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string;
  audience: string;
}

interface AnnouncementState {
  announcements: StoreAnnouncement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: (
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED",
    priority?: "LOW" | "MEDIUM" | "HIGH",
    audience?: string
  ) => Promise<StoreAnnouncement[]>;
  postAnnouncement: (ann: {
    title: string;
    content: string;
    priority?: "LOW" | "MEDIUM" | "HIGH";
    category?: string;
    audience?: string;
  }) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateAnnouncement: (
    id: string,
    updates: Partial<{
      title: string;
      content: string;
      priority: "LOW" | "MEDIUM" | "HIGH";
      category: string;
      audience: string;
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }>,
  ) => Promise<void>;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  loading: false,
  error: null,

  fetchAnnouncements: async (status = "PUBLISHED", priority, audience) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAnnouncements(status, priority, audience);
      const mapped = data.map((a: AnnouncementResponse) => {
        const name = a.author_name || "Administrator";
        const role = a.author_role
          ? a.author_role.charAt(0).toUpperCase() + a.author_role.slice(1)
          : "Admin";

        return {
          id: a.id,
          title: a.title,
          content: a.content,
          target: a.audience,
          priority: a.priority,
          category: a.category,
          audience: a.audience,
          author: role ? `${name} (${role})`.trim() : name,
          authorName: name,
          authorRole: role,
          date: new Date(a.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
      });
      set({ announcements: mapped, loading: false });
      return mapped;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load announcements";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  postAnnouncement: async (ann) => {
    set({ loading: true, error: null });
    try {
      const result = await createAnnouncement({
        title: ann.title,
        content: ann.content,
        priority: ann.priority || "MEDIUM",
        category: ann.category || "General",
        audience: ann.audience || "All School",
        status: "PUBLISHED",
      });

      const name = result.author_name || "Administrator";
      const role = result.author_role
        ? result.author_role.charAt(0).toUpperCase() +
          result.author_role.slice(1)
        : "Admin";

      const newAnn: StoreAnnouncement = {
        id: result.id,
        title: result.title,
        content: result.content,
        target: result.audience || "All School",
        priority: result.priority || "MEDIUM",
        category: result.category || "General",
        audience: result.audience || "All School",
        author: role ? `${name} (${role})`.trim() : name,
        authorName: name,
        authorRole: role,
        date: "Just now",
      };
      set((state) => ({
        announcements: [newAnn, ...state.announcements],
        loading: false,
      }));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to post announcement";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  deleteAnnouncement: async (id) => {
    try {
      await apiDeleteAnnouncement(id);
      set((state) => ({
        announcements: state.announcements.filter((a) => a.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete announcement:", err);
      throw err;
    }
  },

  updateAnnouncement: async (id, updates) => {
    try {
      const apiUpdates = {
        title: updates.title,
        content: updates.content,
        priority: updates.priority,
        category: updates.category,
        audience: updates.audience,
        status: updates.status,
      };

      const result = await apiUpdateAnnouncement(id, apiUpdates);

      set((state) => ({
        announcements: state.announcements.map((a) =>
          a.id === id
            ? {
                ...a,
                title: result.title,
                content: result.content,
                priority: result.priority,
                category: result.category,
                audience: result.audience,
                target: result.audience,
              }
            : a,
        ),
      }));
    } catch (err) {
      console.error("Failed to update announcement:", err);
      throw err;
    }
  },
}));
