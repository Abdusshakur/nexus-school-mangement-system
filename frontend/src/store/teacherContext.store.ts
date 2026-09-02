import { create } from "zustand";
import type {
  TeacherContextResponse,
  TeacherAssignmentContextResponse,
  TeacherStudentContextResponse,
} from "../api/teacherContext";
import {
  fetchMyTeacherProfile,
  fetchMyTeacherAssignments,
  fetchMyTeacherStudents,
  fetchMyAttendanceStats,
  type TeacherAttendanceStatsResponse,
} from "../api/teacherContext";

interface TeacherContextState {
  myProfile: TeacherContextResponse | null;
  myAssignments: TeacherAssignmentContextResponse[];
  myStudents: TeacherStudentContextResponse[];
  attendanceStats: TeacherAttendanceStatsResponse | null;
  loading: boolean;
  error: string | null;

  fetchMyProfile: () => Promise<void>;
  fetchMyAssignments: () => Promise<void>;
  fetchMyStudents: (classId?: string) => Promise<void>;
  fetchMyAttendanceStats: (year?: number, month?: number) => Promise<void>;
  fetchAllContext: () => Promise<void>;
}

export const useTeacherContextStore = create<TeacherContextState>((set) => ({
  myProfile: null,
  myAssignments: [],
  myStudents: [],
  attendanceStats: null,
  loading: false,
  error: null,

  fetchMyProfile: async () => {
    try {
      set({ loading: true, error: null });
      const profile = await fetchMyTeacherProfile();
      set({ myProfile: profile, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyAssignments: async () => {
    try {
      set({ loading: true, error: null });
      const assignments = await fetchMyTeacherAssignments();
      set({ myAssignments: assignments, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyStudents: async (classId?: string) => {
    try {
      set({ loading: true, error: null });
      const students = await fetchMyTeacherStudents(classId);
      set({ myStudents: students, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMyAttendanceStats: async (year?: number, month?: number) => {
    try {
      set({ loading: true, error: null });
      const stats = await fetchMyAttendanceStats(year, month);
      set({ attendanceStats: stats, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchAllContext: async () => {
    try {
      set({ loading: true, error: null });
      const [profile, assignments, students, stats] = await Promise.all([
        fetchMyTeacherProfile().catch(() => null),
        fetchMyTeacherAssignments().catch(() => []),
        fetchMyTeacherStudents().catch(() => []),
        fetchMyAttendanceStats().catch(() => null),
      ]);
      set({
        myProfile: profile,
        myAssignments: assignments,
        myStudents: students,
        attendanceStats: stats,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
