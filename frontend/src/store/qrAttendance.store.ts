import { create } from "zustand";

export interface TeacherCheckIn {
  id: string;
  teacherId: string;
  date: string;
  checkInTime: string;
  status: "present" | "late";
}

export interface QRSession {
  token: string;
  date: string;
  expiresAt: string;
}

interface TeacherAttendanceState {
  teacherCheckIns: TeacherCheckIn[];
  currentQRSession: QRSession | null;
  loading: boolean;
  generateQRSession: (qrType?: "CHECK_IN" | "CHECK_OUT") => Promise<void>;
  markAttendance: (teacherId: string, status: "present" | "late") => void;
}

// Cleaned up mock utilities

import { generateAttendanceQR } from "../api/attendance";

export const useQRAttendanceStore = create<TeacherAttendanceState>((set) => ({
  teacherCheckIns: [],
  currentQRSession: null,
  loading: false,

  generateQRSession: async (qrType = "CHECK_IN") => {
    try {
      set({ loading: true });
      const response = await generateAttendanceQR(qrType);
      set({
        currentQRSession: {
          token: response.raw_token,
          date: new Date().toISOString().slice(0, 10),
          expiresAt: response.expires_at.endsWith('Z') ? response.expires_at : `${response.expires_at}Z`,
        },
        loading: false,
      });
    } catch (err) {
      console.error("Failed to generate QR token", err);
      set({ loading: false });
    }
  },

  markAttendance: (teacherId, status) => {
    set((state) => ({
      teacherCheckIns: [
        ...state.teacherCheckIns,
        {
          id: `c${Date.now()}`,
          teacherId,
          date: new Date().toISOString().slice(0, 10),
          checkInTime: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " AM",
          status,
        },
      ],
    }));
  },
}));
