import { create } from "zustand";

import {
  getClassTimetable,
  createTimetableEntry,
  getTeacherSchedule,
} from "../api/timetable";
import { fetchAllTermsAndSessions } from "../api/academics";

export type TimetableKey = string; // format: classId-day-periodId

export interface TimetableCell {
  subject: string;
  subjectId?: string;
  className: string;
  teacherId: string;
  teacherName: string;
  room?: string;
  startTime?: string;
  endTime?: string;
}

interface TimetableState {
  timetableGrid: Record<string, TimetableCell | undefined>;
  myTimetableGrid: Record<string, TimetableCell | undefined>;
  terms: string[];
  loading: boolean;
  error: string | null;

  fetchTerms: () => Promise<void>;
  fetchTimetable: (classId: string, termId: string) => Promise<void>;
  fetchAllTimetables: (classIds: string[], termId: string) => Promise<void>;
  fetchMyTimetable: (termId: string) => Promise<void>;
  saveTimetableCell: (
    termId: string,
    classId: string,
    day: number,
    dayString: string,
    startTime: string,
    endTime: string,
    periodId: number,
    cell: TimetableCell | undefined,
  ) => Promise<void>;
}

export const useTimetableStore = create<TimetableState>()(
  (set, get) => ({
      timetableGrid: {},
      myTimetableGrid: {},
      terms: [],
      loading: false,
      error: null,

      fetchTerms: async () => {
        set({ loading: true, error: null });
        try {
          const data = await fetchAllTermsAndSessions();
          // Extract term_id to match the backend expectation
          const fetchedTerms = Array.isArray(data)
            ? data.map((item: any) => item.term_id)
            : [];

          if (fetchedTerms.length > 0) {
            set({ terms: fetchedTerms, loading: false });
          } else {
            set({ terms: [], loading: false });
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchTimetable: async (classId: string, termId: string) => {
        set({ loading: true, error: null });
        try {
          const data = await getClassTimetable(classId, termId);
          let grid = { ...get().timetableGrid };
          if (Array.isArray(data)) {
            data.forEach((entry: any) => {
              // Convert day string to index
              const dayStr = entry.day_of_week || "MONDAY";
              const dayMap: Record<string, number> = {
                MONDAY: 0,
                TUESDAY: 1,
                WEDNESDAY: 2,
                THURSDAY: 3,
                FRIDAY: 4,
              };
              const dIndex = dayMap[dayStr] ?? 0;

              // Convert start time to period

              const time = entry.start_time;
              let pIndex = 1;
              if (time === "08:00:00") pIndex = 1;
              else if (time === "09:00:00") pIndex = 2;
              else if (time === "10:00:00") pIndex = 3;
              else if (time === "11:00:00") pIndex = 4;
              else if (time === "11:30:00") pIndex = 5;
              else if (time === "12:30:00") pIndex = 6;
              else if (time === "13:20:00") pIndex = 7;
              else if (time === "14:00:00") pIndex = 8;
              else if (time === "15:00:00") pIndex = 9;

              const key = `${classId}-${dIndex}-${pIndex}`;
              grid[key] = {
                subject: entry.subject_name || entry.subject_id,
                subjectId: entry.subject_id,
                teacherId: entry.teacher_id,
                teacherName: entry.teacher_name || "Assigned Teacher",
                className: entry.class_name || "Class",
                room: entry.room,
                startTime: entry.start_time,
                endTime: entry.end_time,
              };
            });
          }

          set({ timetableGrid: grid, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchAllTimetables: async (classIds: string[], termId: string) => {
        set({ loading: true, error: null });
        try {
          const promises = classIds.map((id) =>
            getClassTimetable(id, termId).catch(() => []),
          );
          const results = await Promise.all(promises);

          let grid: Record<string, TimetableCell | undefined> = {};

          results.forEach((data, index) => {
            const classId = classIds[index];
            if (Array.isArray(data)) {
              data.forEach((entry: any) => {
                const dayStr = entry.day_of_week || "MONDAY";
                const dayMap: Record<string, number> = {
                  MONDAY: 0,
                  TUESDAY: 1,
                  WEDNESDAY: 2,
                  THURSDAY: 3,
                  FRIDAY: 4,
                };
                const dIndex = dayMap[dayStr] ?? 0;

                const time = entry.start_time;
                let pIndex = 1;
                if (time === "08:00:00") pIndex = 1;
                else if (time === "09:00:00") pIndex = 2;
                else if (time === "10:00:00") pIndex = 3;
                else if (time === "11:00:00") pIndex = 4;
                else if (time === "11:30:00") pIndex = 5;
                else if (time === "12:30:00") pIndex = 6;
                else if (time === "13:20:00") pIndex = 7;
                else if (time === "14:00:00") pIndex = 8;
                else if (time === "15:00:00") pIndex = 9;

                const key = `${classId}-${dIndex}-${pIndex}`;
                grid[key] = {
                  subject: entry.subject_name || entry.subject_id,
                  subjectId: entry.subject_id,
                  teacherId: entry.teacher_id,
                  teacherName: entry.teacher_name || "Assigned Teacher",
                  className: entry.class_name || "Class",
                  room: entry.room,
                  startTime: entry.start_time,
                  endTime: entry.end_time,
                };
              });
            }
          });

          set({ timetableGrid: grid, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      fetchMyTimetable: async (termId: string) => {
        set({ loading: true, error: null });
        try {
          const data = await getTeacherSchedule(termId);
          let grid: Record<string, TimetableCell | undefined> = {};
          if (Array.isArray(data)) {
            data.forEach((entry: any) => {
              const time = entry.start_time;
              let pIndex = 1;
              if (time === "08:00:00") pIndex = 1;
              else if (time === "09:00:00") pIndex = 2;
              else if (time === "10:00:00") pIndex = 3;
              else if (time === "11:00:00") pIndex = 4;
              else if (time === "11:30:00") pIndex = 5;
              else if (time === "12:30:00") pIndex = 6;
              else if (time === "13:20:00") pIndex = 7;
              else if (time === "14:00:00") pIndex = 8;
              else if (time === "15:00:00") pIndex = 9;

              const dayStr = entry.day_of_week || "MONDAY";
              const dayMap: Record<string, number> = {
                MONDAY: 0,
                TUESDAY: 1,
                WEDNESDAY: 2,
                THURSDAY: 3,
                FRIDAY: 4,
              };
              const dIndex = dayMap[dayStr] ?? 0;

              const key = `${dIndex}-${pIndex}`;
              grid[key] = {
                subject: entry.subject_name || entry.subject_id,
                subjectId: entry.subject_id,
                teacherId: entry.teacher_id,
                teacherName: entry.teacher_name || "Assigned Teacher",
                className: entry.class_name || "Class",
                room: entry.room,
                startTime: entry.start_time,
                endTime: entry.end_time,
              };
            });
          } else {
            grid = data || {};
          }
          set({ myTimetableGrid: grid, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      saveTimetableCell: async (
        termId,
        classId,
        day,
        dayString,
        startTime,
        endTime,
        periodId,
        cell,
      ) => {
        set({ loading: true, error: null });
        try {
          if (cell) {
            // Create or update entry
            await createTimetableEntry({
              term_id: termId,
              class_id: classId,
              subject_id: cell.subjectId || cell.subject,
              teacher_id: cell.teacherId,
              day_of_week: dayString,
              start_time: startTime,
              end_time: endTime,
            });
          }

          const key = `${classId}-${day}-${periodId}`;
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
    })
);
