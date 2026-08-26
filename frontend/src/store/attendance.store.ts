import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StudentAttendance } from "../pages/teacher/attendance/data";

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

  saveRoster: (key: string, roster: StudentAttendance[]) => void;
  saveHistory: (record: AttendanceHistoryRecord) => void;
}

export const useAttendanceStore = create<AttendanceState>()(
  persist(
    (set) => ({
      rosters: {},
      history: [],

      saveRoster: (key, roster) =>
        set((state) => ({
          rosters: {
            ...state.rosters,
            [key]: roster,
          },
        })),

      saveHistory: (record) =>
        set((state) => {
          // Check if history already has an entry for this class and date
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
    }),
    {
      name: "nexus_attendance_store",
    },
  ),
);
