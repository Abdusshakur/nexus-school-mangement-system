import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TimetableKey = string; // format: classId-day-periodId

export interface TimetableCell {
  subject: string;
  className: string;
  teacherId: string;
  teacherName: string;
  room?: string;
}

interface TimetableState {
  timetableGrid: Record<string, TimetableCell | undefined>;
  terms: string[];
  loading: boolean;
  error: string | null;

  fetchTerms: () => Promise<void>;
  fetchTimetable: (term: string) => Promise<void>;
  saveTimetableCell: (term: string, key: TimetableKey, cell: TimetableCell | undefined) => Promise<void>;
}

// Mocking backend since we don't have python endpoints for timetable yet
let MOCK_TERMS = ["2025-26 Term 3", "2025-26 Term 2", "2025-26 Term 1"];
let MOCK_TIMETABLE_DB: Record<string, Record<string, TimetableCell | undefined>> = {
  "2025-26 Term 3": {},
};

export const useTimetableStore = create<TimetableState>()(
  persist(
    (set) => ({
      timetableGrid: {},
      terms: [],
      loading: false,
      error: null,

      fetchTerms: async () => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise((r) => setTimeout(r, 400));
          set({ terms: MOCK_TERMS, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchTimetable: async (term: string) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise((r) => setTimeout(r, 400));
          const data = MOCK_TIMETABLE_DB[term] || {};
          set({ timetableGrid: data, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      saveTimetableCell: async (term, key, cell) => {
        set({ loading: true, error: null });
        try {
          // Simulate API call
          await new Promise((r) => setTimeout(r, 400));
          if (!MOCK_TIMETABLE_DB[term]) {
            MOCK_TIMETABLE_DB[term] = {};
          }
          MOCK_TIMETABLE_DB[term][key] = cell;
          
          set((state) => ({
            timetableGrid: {
              ...state.timetableGrid,
              [key]: cell,
            },
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: "nexus-timetable-store",
    }
  )
);
