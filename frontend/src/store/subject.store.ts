import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcademicSubject } from "../api/academics";
import { fetchSubjects, createSubject, deleteSubject } from "../api/academics";

interface SubjectState {
  subjects: AcademicSubject[];
  loading: boolean;
  error: string | null;

  loadSubjects: (force?: boolean) => Promise<void>;
  addSubject: (name: string) => Promise<void>;
  removeSubject: (subjectId: string) => Promise<void>;
}

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set, get) => ({
      subjects: [],
      loading: false,
      error: null,

      loadSubjects: async (force = false) => {
        const { subjects, loading } = get();
        if (loading) return;
        if (subjects.length > 0 && !force) return;

        set({ loading: true, error: null });
        try {
          const data = await fetchSubjects();
          set({ subjects: data, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addSubject: async (name) => {
        set({ loading: true, error: null });
        try {
          const newSubject = await createSubject({ name });
          set((state) => ({
            subjects: [...state.subjects, newSubject],
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      removeSubject: async (subjectId) => {
        set({ loading: true, error: null });
        try {
          await deleteSubject(subjectId);
          set((state) => ({
            subjects: state.subjects.filter((s) => s.id !== subjectId),
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: "nexus-subject-store",
    }
  )
);
