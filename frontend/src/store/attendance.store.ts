import { create } from "zustand";

import { 
  fetchDailyAttendanceSummary, 
  getClassRosterForAttendance,
  approveAttendance,
  rejectAttendance,
  reopenAttendance,
  type DailyAttendanceSummaryResponse
} from "../api/attendance";
import type { StudentAttendance } from "../pages/teacher/attendance/data"; // Used for legacy mocks, will be replaced

export type AttendanceHistoryRecord = {
  class: string;
  date: string;
  rate: number;
  present: number;
  total: number;
};

interface AttendanceState {
  rosters: Record<string, StudentAttendance[]>;
  history: AttendanceHistoryRecord[];
  
  // New API states
  dailySummary: DailyAttendanceSummaryResponse | null;
  activeClassRoster: any[]; // Replace with correct typing if needed
  activeSessionId: string | null;
  activeSessionStatus: string | null;
  loading: boolean;
  error: string | null;

  saveRoster: (key: string, roster: StudentAttendance[]) => void;
  saveHistory: (record: AttendanceHistoryRecord) => void;
  
  fetchDailySummary: (date?: string) => Promise<void>;
  fetchClassRoster: (classId: string, date: string) => Promise<void>;
  approveSession: (sessionId: string, reason?: string) => Promise<void>;
  rejectSession: (sessionId: string, reason?: string) => Promise<void>;
  reopenSession: (sessionId: string, reason?: string) => Promise<void>;
}

export const useAttendanceStore = create<AttendanceState>()(
  (set, get) => ({
      rosters: {},
      history: [],
      dailySummary: null,
      activeClassRoster: [],
      activeSessionId: null,
      activeSessionStatus: null,
      loading: false,
      error: null,

      saveRoster: (key, roster) =>
        set((state) => ({ rosters: { ...state.rosters, [key]: roster } })),

      saveHistory: (record) =>
        set((state) => {
          const existingIndex = state.history.findIndex(
            (h) => h.class === record.class && h.date === record.date,
          );
          if (existingIndex >= 0) {
            const updatedHistory = [...state.history];
            updatedHistory[existingIndex] = record;
            return { history: updatedHistory };
          }
          return { history: [record, ...state.history] };
        }),

      fetchDailySummary: async (date?: string) => {
        set({ loading: true, error: null });
        try {
          const summary = await fetchDailyAttendanceSummary(date);
          set({ dailySummary: summary, loading: false });
        } catch (error: any) {
          console.error("Failed to fetch daily summary:", error);
          set({ error: error.message || "Failed to load summary", loading: false });
        }
      },

      fetchClassRoster: async (classId: string, date: string) => {
        set({ loading: true, error: null, activeClassRoster: [], activeSessionId: null, activeSessionStatus: null });
        try {
          const rosterResponse = await getClassRosterForAttendance(classId, date);
          set({ 
            activeClassRoster: rosterResponse?.students || [],
            activeSessionId: rosterResponse?.attendance_session_id || null,
            activeSessionStatus: rosterResponse?.attendance_status || null,
            loading: false 
          });
        } catch (error: any) {
          console.error("Failed to fetch class roster:", error);
          set({ error: error.message || "Failed to load roster", loading: false });
        }
      },

      approveSession: async (sessionId: string, reason?: string) => {
        set({ loading: true, error: null });
        try {
          await approveAttendance(sessionId, reason);
          set({ loading: false, activeSessionStatus: "APPROVED" });
          // Re-fetch the daily summary to update the status
          const state = get();
          if (state.dailySummary?.date) {
            await state.fetchDailySummary(state.dailySummary.date);
          }
        } catch (error: any) {
          console.error("Failed to approve attendance:", error);
          set({ error: error.message || "Failed to approve", loading: false });
          throw error;
        }
      },

      rejectSession: async (sessionId: string, reason?: string) => {
        set({ loading: true, error: null });
        try {
          await rejectAttendance(sessionId, reason);
          set({ loading: false, activeSessionStatus: "REJECTED" });
          const state = get();
          if (state.dailySummary?.date) {
            await state.fetchDailySummary(state.dailySummary.date);
          }
        } catch (error: any) {
          console.error("Failed to reject attendance:", error);
          set({ error: error.message || "Failed to reject", loading: false });
          throw error;
        }
      },

      reopenSession: async (sessionId: string, reason?: string) => {
        set({ loading: true, error: null });
        try {
          await reopenAttendance(sessionId, reason);
          set({ loading: false, activeSessionStatus: "DRAFT" });
          const state = get();
          if (state.dailySummary?.date) {
            await state.fetchDailySummary(state.dailySummary.date);
          }
        } catch (error: any) {
          console.error("Failed to reopen attendance:", error);
          set({ error: error.message || "Failed to reopen", loading: false });
          throw error;
        }
      },
  })
);
