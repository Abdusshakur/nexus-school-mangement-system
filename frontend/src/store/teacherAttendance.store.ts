import { create } from "zustand";

export interface AttendanceSubmission {
  id: string;
  teacherId: string;
  teacherName: string;
  classId: string;
  className: string;
  subject: string;
  date: string;
  entries: {
    studentId: string;
    studentName: string;
    status: "P" | "A" | "L";
  }[];
  submittedAt: string;
}

interface TeacherAttendanceState {
  attendanceSubmissions: AttendanceSubmission[];
  getTeacherClass: (teacherId: string) => string | null;
  submitAttendance: (data: Omit<AttendanceSubmission, "id" | "submittedAt">) => void;
}

export const useTeacherAttendanceStore = create<TeacherAttendanceState>((set) => ({
  attendanceSubmissions: [],
  getTeacherClass: (teacherId: string) => {
    // Mock logic: T001 gets SS2SCI
    if (teacherId === "T001") return "SS2SCI";
    return null;
  },
  submitAttendance: (data) =>
    set((state) => ({
      attendanceSubmissions: [
        ...state.attendanceSubmissions,
        {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          submittedAt: new Date().toISOString(),
        },
      ],
    })),
}));
