import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Announcement } from "../pages/teacher/announcements/data";
import { DEFAULT_ANNOUNCEMENTS } from "../pages/teacher/announcements/data";

interface AnnouncementState {
  announcements: Announcement[];
  
  // Actions
  postAnnouncement: (ann: Omit<Announcement, "id">) => void;
  deleteAnnouncement: (id: string) => void;
}

export const useAnnouncementStore = create<AnnouncementState>()(
  persist(
    (set) => ({
      announcements: DEFAULT_ANNOUNCEMENTS,

      postAnnouncement: (ann) =>
        set((state) => {
          const newAnn: Announcement = {
            id: "ANN-" + Date.now(),
            ...ann,
          };
          return {
            announcements: [newAnn, ...state.announcements],
          };
        }),

      deleteAnnouncement: (id) =>
        set((state) => ({
          announcements: state.announcements.filter((a) => a.id !== id),
        })),
    }),
    {
      name: "nexus_announcements_store",
    }
  )
);
