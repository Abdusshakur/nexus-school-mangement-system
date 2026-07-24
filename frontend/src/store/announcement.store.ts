import { create } from "zustand";
import {
  fetchAnnouncements,
  createAnnouncement,
  type AnnouncementResponse,
} from "../api/announcements";

export interface StoreAnnouncement {
  id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  date: string;
  priority: "low" | "medium" | "high";
  category: string;
  audience: string;
}

export function serializeAnnouncementContent(body: string, meta: { priority: string; category: string; audience: string }) {
  return `[META:priority=${meta.priority};category=${meta.category};audience=${meta.audience}]${body}`;
}

export function deserializeAnnouncementContent(content: string) {
  const match = content.match(/^\[META:priority=(.*?);category=(.*?);audience=(.*?)\](.*)/s);
  if (match) {
    return {
      priority: match[1] as "low" | "medium" | "high",
      category: match[2],
      audience: match[3],
      body: match[4].trim(),
    };
  }
  return {
    priority: "medium" as const,
    category: "General",
    audience: "All School",
    body: content,
  };
}

interface AnnouncementState {
  announcements: StoreAnnouncement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<StoreAnnouncement[]>;
  postAnnouncement: (ann: { title: string; content: string; priority?: string; category?: string; audience?: string }) => Promise<void>;
  deleteAnnouncement: (id: string) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  loading: false,
  error: null,

  fetchAnnouncements: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchAnnouncements("PUBLISHED");
      const mapped = data.map((a: AnnouncementResponse) => {
        const name = a.author_name || "";
        const role = a.author_role ? a.author_role.charAt(0).toUpperCase() + a.author_role.slice(1) : "";

        const meta = deserializeAnnouncementContent(a.content);

        return {
          id: a.id,
          title: a.title,
          content: meta.body,
          target: meta.audience,
          priority: meta.priority,
          category: meta.category,
          audience: meta.audience,
          author: role ? `${name} (${role})`.trim() : name,
          date: new Date(a.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
      });
      set({ announcements: mapped, loading: false });
      return mapped;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load announcements";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  postAnnouncement: async (ann) => {
    set({ loading: true, error: null });
    try {
      const metaContent = serializeAnnouncementContent(ann.content, {
        priority: ann.priority || "medium",
        category: ann.category || "General",
        audience: ann.audience || "All School",
      });

      const result = await createAnnouncement({
        title: ann.title,
        content: metaContent,
        status: "PUBLISHED",
      });

      const name = result.author_name || "";
      const role = result.author_role ? result.author_role.charAt(0).toUpperCase() + result.author_role.slice(1) : "";

      const meta = deserializeAnnouncementContent(result.content);

      const newAnn: StoreAnnouncement = {
        id: result.id,
        title: result.title,
        content: meta.body,
        target: meta.audience,
        priority: meta.priority,
        category: meta.category,
        audience: meta.audience,
        author: role ? `${name} (${role})`.trim() : name,
        date: "Just now",
      };
      set((state) => ({
        announcements: [newAnn, ...state.announcements],
        loading: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post announcement";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  deleteAnnouncement: (id) => {
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    }));
  },
}));
