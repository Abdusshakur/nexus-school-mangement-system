import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcademicClass } from "../api/academics";
import { fetchClasses, createClass, deleteClass, assignFormTeacher } from "../api/academics";

function sortClasses(classes: AcademicClass[]): AcademicClass[] {
  const getWeight = (prefix: string) => {
    const p = prefix.toUpperCase();
    if (p.includes("PRE") || p.includes("NUR")) return 1;
    if (p.includes("PRI") || p.includes("BAS") || p.includes("YEAR") || p.includes("GRADE")) return 2;
    if (p === "JSS" || p === "JS") return 3;
    if (p === "SS" || p === "S") return 4;
    return 5;
  };

  return [...classes].sort((a, b) => {
    const matchA = a.name.match(/^([a-zA-Z]+)?\s*(\d+)?\s*(.*)?$/);
    const matchB = b.name.match(/^([a-zA-Z]+)?\s*(\d+)?\s*(.*)?$/);

    const prefixA = matchA?.[1] || "";
    const prefixB = matchB?.[1] || "";
    const weightA = getWeight(prefixA);
    const weightB = getWeight(prefixB);

    if (weightA !== weightB) return weightA - weightB;

    const numA = parseInt(matchA?.[2] || "0", 10);
    const numB = parseInt(matchB?.[2] || "0", 10);
    if (numA !== numB) return numA - numB;

    const suffixA = (matchA?.[3] || "").trim();
    const suffixB = (matchB?.[3] || "").trim();
    return suffixA.localeCompare(suffixB);
  });
}

interface ClassState {
  classes: AcademicClass[];
  classTeacherAssignments: Record<string, string>;
  loading: boolean;
  error: string | null;

  loadClasses: (force?: boolean) => Promise<void>;
  addClass: (name: string) => Promise<void>;
  removeClass: (classId: string) => Promise<void>;
  assignClassTeacher: (classId: string, teacherId: string) => Promise<void>;
  removeClassTeacher: (classId: string) => Promise<void>;
}

export const useClassStore = create<ClassState>()(
  persist(
    (set, get) => ({
      classes: [],
      classTeacherAssignments: {},
      loading: false,
      error: null,

      assignClassTeacher: async (classId, teacherId) => {
        set({ loading: true, error: null });
        try {
          await assignFormTeacher(classId, teacherId);
          await get().loadClasses(true);
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      removeClassTeacher: async (classId) => {
        set({ loading: true, error: null });
        try {
          await assignFormTeacher(classId, null);
          await get().loadClasses(true);
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      loadClasses: async (force = false) => {
        const { classes, loading } = get();
        if (loading && !force) return;
        if (classes.length > 0 && !force) {
          // Ensure cached classes are sorted (in case of old cached data)
          set({ classes: sortClasses(classes) });
          return;
        }

        set({ loading: true, error: null });
        try {
          const data = await fetchClasses();
          const newAssignments: Record<string, string> = {};
          data.forEach(c => {
             if (c.form_teacher_id) {
                newAssignments[c.id] = c.form_teacher_id;
             }
          });
          set({ classes: sortClasses(data), classTeacherAssignments: newAssignments, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addClass: async (name) => {
        set({ loading: true, error: null });
        try {
          const newClass = await createClass({ name });
          set((state) => ({
            classes: sortClasses([...state.classes, newClass]),
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
