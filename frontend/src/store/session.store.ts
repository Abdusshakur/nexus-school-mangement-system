import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  term: string;
  status: "active" | "archived" | "locked";
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  teacherId: string;
  teacherName: string;
  sessionName: string;
  reason: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  approvedAt?: string;
}

interface SessionState {
  academicSessions: AcademicSession[];
  sessionAccessRequests: AccessRequest[];
  startNewSession: (data: Omit<AcademicSession, "id" | "status" | "createdAt">) => void;
  approveAccessRequest: (id: string) => void;
  rejectAccessRequest: (id: string) => void;
}

const mockSessions: AcademicSession[] = [
  {
    id: "s1",
    name: "2026/2027",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    term: "Third Term",
    status: "active",
    createdAt: "2026-09-01T00:00:00.000Z",
  },
  {
    id: "s2",
    name: "2025/2026",
    startDate: "2025-09-01",
    endDate: "2026-08-31",
    term: "Third Term",
    status: "archived",
    createdAt: "2025-09-01T00:00:00.000Z",
  },
];

const mockRequests: AccessRequest[] = [
  {
    id: "r1",
    teacherId: "t1",
    teacherName: "Alice Smith",
    sessionName: "2025/2026",
    reason: "Need to review previous year results for promotion evaluation",
    requestedAt: new Date(Date.now() - 3600000).toISOString(),
    status: "pending",
  },
];

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      academicSessions: mockSessions,
      sessionAccessRequests: mockRequests,

      startNewSession: (data) =>
        set((state) => {
          const newSession: AcademicSession = {
            ...data,
            createdAt: new Date().toISOString(),
            id: Math.random().toString(36).substring(7),
            status: "active",
          };

          const updatedSessions = state.academicSessions.map((s) =>
            s.status === "active" ? { ...s, status: "archived" as const } : s
          );

          return { academicSessions: [newSession, ...updatedSessions] };
        }),

      approveAccessRequest: (id) =>
        set((state) => ({
          sessionAccessRequests: state.sessionAccessRequests.map((r) =>
            r.id === id
              ? { ...r, status: "approved", approvedAt: new Date().toISOString() }
              : r
          ),
        })),

      rejectAccessRequest: (id) =>
        set((state) => ({
          sessionAccessRequests: state.sessionAccessRequests.map((r) =>
            r.id === id ? { ...r, status: "rejected" } : r
          ),
        })),
    }),
    {
      name: "nexus-session-store",
    }
  )
);
