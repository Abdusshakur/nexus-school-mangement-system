import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcademicClass } from "../api/academics";
import { fetchClasses, createClass, deleteClass } from "../api/academics";

interface ClassState {
  classes: AcademicClass[];
  classTeacherAssignments: Record<string, string>;
  loading: boolean;
  error: string | null;

  loadClasses: (force?: boolean) => Promise<void>;
  addClass: (name: string) => Promise<void>;
  removeClass: (classId: string) => Promise<void>;
  assignClassTeacher: (classId: string, teacherId: string) => void;
  removeClassTeacher: (classId: string) => void;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      classes: [],
      classTeacherAssignments: {},
      loading: false,
      error: null,

      assignClassTeacher: (classId, teacherId) =>
        set((state) => ({
          classTeacherAssignments: {
            ...state.classTeacherAssignments,
            [classId]: teacherId,
          },
        })),

      removeClassTeacher: (classId) =>
        set((state) => {
          const next = { ...state.classTeacherAssignments };
          delete next[classId];
          return { classTeacherAssignments: next };
        }),

      loadClasses: async (force = false) => {
        const { classes, loading } = get();
        if (loading) return;
        if (classes.length > 0 && !force) return;

        set({ loading: true, error: null });
        try {
          const data = await fetchClasses();
          set({ classes: data, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addClass: async (name) => {
        set({ loading: true, error: null });
        try {
          const newClass = await createClass({ name });
          set((state) => ({
            classes: [...state.classes, newClass],
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      removeClass: async (classId) => {
        set({ loading: true, error: null });
        try {
          await deleteClass(classId);
          set((state) => ({
            classes: state.classes.filter((c) => c.id !== classId),
            loading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
    }),
    {
      name: "nexus-class-store",
    }
  )
);
