import { create } from "zustand";

export interface GradeRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  term: string;
  session: string;
  submitted: boolean;
  savedAt: string;
  grades: {
    studentId: string;
    studentName: string;
    ca1: number;
    ca2: number;
    exam: number;
  }[];
}

interface GradeState {
  gradeRecords: GradeRecord[];
  saveGrades: (record: Omit<GradeRecord, "id" | "savedAt">) => void;
}

export const useGradeStore = create<GradeState>((set) => ({
  gradeRecords: [],
  saveGrades: (record) =>
    set((state) => {
      const existingIdx = state.gradeRecords.findIndex(
        (r) =>
          r.teacherId === record.teacherId &&
          r.classId === record.classId &&
          r.subject === record.subject &&
          r.term === record.term &&
          r.session === record.session
      );

      const newRecord = {
        ...record,
        id: existingIdx >= 0 ? state.gradeRecords[existingIdx].id : Math.random().toString(36).substr(2, 9),
        savedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        const updated = [...state.gradeRecords];
        updated[existingIdx] = newRecord;
        return { gradeRecords: updated };
      }

      return { gradeRecords: [...state.gradeRecords, newRecord] };
    }),
}));
