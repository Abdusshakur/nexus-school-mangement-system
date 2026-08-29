import { create } from "zustand";
import { 
  submitClassAttendance, 
  getMyAttendanceClasses,
  getClassRosterForAttendance,
  type AttendanceSubmitRequest 
} from "../api/attendance";

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
  teacherClasses: any[];
  classRosterData: any | null;
  loading: boolean;
  error: string | null;
  getTeacherClass: (teacherId: string) => string | null;
  submitAttendance: (data: Omit<AttendanceSubmission, "id" | "submittedAt">) => Promise<void>;
  fetchMyClasses: () => Promise<void>;
  fetchClassRoster: (classId: string, date: string) => Promise<void>;
}

export const useTeacherAttendanceStore = create<TeacherAttendanceState>((set) => ({
  attendanceSubmissions: [],
  teacherClasses: [],
  classRosterData: null,
  loading: false,
  error: null,
  getTeacherClass: (teacherId: string) => {
    // Legacy mock function, left for compatibility if needed elsewhere
    if (teacherId === "T001") return "SS2SCI";
    return null;
  },
  
  fetchMyClasses: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getMyAttendanceClasses();
      set({ teacherClasses: data || [], loading: false });
    } catch (error: any) {
      console.error("Failed to fetch teacher classes:", error);
      set({ error: error.message, loading: false });
    }
  },

  fetchClassRoster: async (classId: string, date: string) => {
    set({ loading: true, error: null, classRosterData: null });
    try {
      const data = await getClassRosterForAttendance(classId, date);
      set({ classRosterData: data, loading: false });
    } catch (error: any) {
      console.error("Failed to fetch class roster:", error);
      set({ error: error.message, loading: false });
    }
  },

  submitAttendance: async (data) => {
    const payload: AttendanceSubmitRequest = {
      date: new Date().toISOString().split("T")[0],
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
