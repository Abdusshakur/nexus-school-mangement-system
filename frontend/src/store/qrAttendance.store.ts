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
  validUntil: string;
}

interface TeacherAttendanceState {
  teacherCheckIns: TeacherCheckIn[];
  currentQRSession: QRSession | null;
  loading: boolean;
  generateQRSession: () => void;
  markAttendance: (teacherId: string, status: "present" | "late") => void;
}

const generateRandomToken = () => {
  return "NEXUS-" + Math.random().toString(36).substring(2, 10).toUpperCase();
};

const getValidUntilTime = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + 30);
  return now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

// Initial mock check-ins
const MOCK_CHECKINS: TeacherCheckIn[] = [
  { id: "c1", teacherId: "t1", date: new Date().toISOString().slice(0, 10), checkInTime: "07:15 AM", status: "present" },
  { id: "c2", teacherId: "t2", date: new Date().toISOString().slice(0, 10), checkInTime: "07:35 AM", status: "late" },
];

export const useQRAttendanceStore = create<TeacherAttendanceState>((set) => ({
  teacherCheckIns: MOCK_CHECKINS,
  currentQRSession: {
    token: generateRandomToken(),
    date: new Date().toISOString().slice(0, 10),
    validUntil: getValidUntilTime(),
  },
  loading: false,

  generateQRSession: () => {
    set({
      currentQRSession: {
        token: generateRandomToken(),
        date: new Date().toISOString().slice(0, 10),
        validUntil: getValidUntilTime(),
      },
    });
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
