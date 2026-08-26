import { create } from "zustand";
import { submitClassAttendance, type AttendanceSubmitRequest } from "../api/attendance";

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
  submitAttendance: (data: Omit<AttendanceSubmission, "id" | "submittedAt">) => Promise<void>;
}

export const useTeacherAttendanceStore = create<TeacherAttendanceState>((set) => ({
  attendanceSubmissions: [],
  getTeacherClass: (teacherId: string) => {
    // Mock logic: T001 gets SS2SCI
    if (teacherId === "T001") return "SS2SCI";
    return null;
  },
  submitAttendance: async (data) => {
    const payload: AttendanceSubmitRequest = {
      attendance_date: new Date().toISOString().split("T")[0],
      class_id: data.classId,
      records: data.entries.map((e) => ({
        student_id: e.studentId,
        status: e.status === "P" ? "PRESENT" : e.status === "A" ? "ABSENT" : "LATE",
      })),
    };

    try {
      await submitClassAttendance(payload);
    } catch (error) {
      console.error("Failed to submit attendance to backend:", error);
      throw error;
    }

    set((state) => ({
      attendanceSubmissions: [
        ...state.attendanceSubmissions,
        {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          submittedAt: new Date().toISOString(),
        },
      ],
    }));
  },
}));
