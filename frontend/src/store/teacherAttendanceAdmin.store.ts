import { create } from "zustand";
import {
  fetchTeacherAttendanceList,
  correctTeacherAttendance,
  processMissedTeacherAttendance,
  type TeacherAttendanceAdminItem,
  type TeacherAttendanceCorrectionPayload,
} from "../api/teacherAttendanceAdmin";
import { toast } from "sonner";

interface TeacherAttendanceAdminState {
  records: TeacherAttendanceAdminItem[];
  loading: boolean;
  error: string | null;

  loadRecords: (date?: string, teacherId?: string, status?: string) => Promise<void>;
  applyCorrection: (attendanceId: string, payload: TeacherAttendanceCorrectionPayload) => Promise<void>;
  processMissed: (date?: string) => Promise<void>;
}

export const useTeacherAttendanceAdminStore = create<TeacherAttendanceAdminState>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  loadRecords: async (date, teacherId, status) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTeacherAttendanceList(date, teacherId, status);
      set({ records: data, loading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to load teacher attendance records";
      set({ error: msg, loading: false });
    }
  },

  applyCorrection: async (attendanceId, payload) => {
    const updatedRecord = await correctTeacherAttendance(attendanceId, payload);
    set((state) => ({
      records: state.records.map((r) => (r.id === attendanceId ? updatedRecord : r)),
    }));
    toast.success("Attendance correction applied successfully");
  },

  processMissed: async (date) => {
    await processMissedTeacherAttendance(date);
    toast.success("Missed attendance processed successfully");
    // Reload records to reflect the new missed check-in statuses
    await get().loadRecords(date);
  },
}));
