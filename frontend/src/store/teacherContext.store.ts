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
} from "../api/teacherContext";

interface TeacherContextState {
  myProfile: TeacherContextResponse | null;
  myAssignments: TeacherAssignmentContextResponse[];
  myStudents: TeacherStudentContextResponse[];
  loading: boolean;
  error: string | null;

  fetchMyProfile: () => Promise<void>;
  fetchMyAssignments: () => Promise<void>;
  fetchMyStudents: (classId?: string) => Promise<void>;
  fetchAllContext: () => Promise<void>;
}

export const useTeacherContextStore = create<TeacherContextState>((set) => ({
  myProfile: null,
  myAssignments: [],
  myStudents: [],
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

  fetchAllContext: async () => {
    try {
      set({ loading: true, error: null });
      const [profile, assignments, students] = await Promise.all([
        fetchMyTeacherProfile(),
        fetchMyTeacherAssignments(),
        fetchMyTeacherStudents(),
      ]);
      set({
        myProfile: profile,
        myAssignments: assignments,
        myStudents: students,
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));
