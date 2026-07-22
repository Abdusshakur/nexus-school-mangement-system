import { create } from "zustand";
import {
  fetchAnnouncements,
  createAnnouncement,
  type AnnouncementResponse,
} from "../api/announcements";

import { useAuthStore } from "./auth";
import { useTeacherStore } from "./teacher.store";

export interface StoreAnnouncement {
  id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  date: string;
}

interface AnnouncementState {
  announcements: StoreAnnouncement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: (force?: boolean) => Promise<StoreAnnouncement[]>;
  postAnnouncement: (ann: { title: string; content: string }) => Promise<void>;
  deleteAnnouncement: (id: string) => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set, get) => ({
  announcements: [],
  loading: false,
  error: null,

  fetchAnnouncements: async (force = false) => {
    const current = get().announcements;
    if (current.length > 0 && !force) return current;

    set({ loading: true, error: null });
    try {
      const data = await fetchAnnouncements("PUBLISHED");
      const mapped = data.map((a: AnnouncementResponse) => {
        let name = "Staff Member";
        let role = "Administrator";

        const currentUser = useAuthStore.getState().user;
        if (currentUser && a.author_id === currentUser.id) {
          role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
          const fName = currentUser.first_name || "";
          const lName = currentUser.last_name || "";
          name = fName || lName ? `${fName} ${lName}`.trim() : "Campus User";
        } else {
          const teacher = useTeacherStore.getState().teachers.find((t) => t.id === a.author_id);
          if (teacher) {
            name = teacher.name;
            role = "Teacher";
          }
        }

        if (a.author_name) name = a.author_name;
        if (a.author_role) role = a.author_role.charAt(0).toUpperCase() + a.author_role.slice(1);

        return {
          id: a.id,
          title: a.title,
          content: a.content,
          target: "All School",
          author: `${name} (${role})`,
          date: new Date(a.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
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
      const result = await createAnnouncement({
        title: ann.title,
        content: ann.content,
        status: "PUBLISHED",
      });

      let name = "Staff Member";
      let role = "Administrator";

      const currentUser = useAuthStore.getState().user;
      if (currentUser && result.author_id === currentUser.id) {
        role = currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
        const fName = currentUser.first_name || "";
        const lName = currentUser.last_name || "";
        name = fName || lName ? `${fName} ${lName}`.trim() : "Campus User";
      }

      if (result.author_name) name = result.author_name;
      if (result.author_role) role = result.author_role.charAt(0).toUpperCase() + result.author_role.slice(1);

      const newAnn: StoreAnnouncement = {
        id: result.id,
        title: result.title,
        content: result.content,
        target: "All School",
        author: `${name} (${role})`,
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
