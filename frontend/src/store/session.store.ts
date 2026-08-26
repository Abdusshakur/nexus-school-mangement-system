import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchAllTermsAndSessions, createSession, createTerm } from "../api/academics";

export interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "archived" | "locked";
}

export interface AcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  term: string;
  termId?: string;
  status: "active" | "archived" | "locked";
  createdAt: string;
  terms: AcademicTerm[];
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
  loading: boolean;
  error: string | null;
  fetchSessions: () => Promise<void>;
  startNewSession: (data: Omit<AcademicSession, "id" | "status" | "createdAt" | "terms">) => Promise<void>;
  addNewTerm: (sessionId: string, data: { name: string; startDate: string; endDate: string; isActive: boolean }) => Promise<void>;
  approveAccessRequest: (id: string) => void;
  rejectAccessRequest: (id: string) => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      academicSessions: [],
      sessionAccessRequests: [],
      loading: false,
      error: null,

      fetchSessions: async () => {
        set({ loading: true, error: null });
        try {
          const data = await fetchAllTermsAndSessions();
          
          let rawData: any[] = [];
          if (Array.isArray(data)) rawData = data;
          else if (data?.items && Array.isArray(data.items)) rawData = data.items;

          const sessionMap = new Map<string, AcademicSession>();

          rawData.forEach((item: any) => {
            const sessionId = item.session_id;
            const term: AcademicTerm = {
              id: item.term_id,
              name: item.term_name,
              startDate: item.term_start_date,
              endDate: item.term_end_date,
              status: item.is_term_active ? "active" : "archived"
            };

            if (sessionMap.has(sessionId)) {
              sessionMap.get(sessionId)!.terms.push(term);
              if (item.is_term_active) {
                // update session's active term info if this term is active
                const s = sessionMap.get(sessionId)!;
                s.term = item.term_name;
                s.termId = item.term_id;
                s.startDate = item.term_start_date;
                s.endDate = item.term_end_date;
              }
            } else {
              sessionMap.set(sessionId, {
                id: sessionId,
                name: item.session_name,
                startDate: item.term_start_date,
                endDate: item.term_end_date,
                term: item.term_name,
                termId: item.term_id,
                status: item.is_session_active ? "active" : "archived",
                createdAt: new Date().toISOString(),
                terms: [term],
              });
            }
          });

          set({ academicSessions: Array.from(sessionMap.values()), loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      startNewSession: async (data) => {
        set({ loading: true, error: null });
        try {
          const sessionRes = await createSession({
            name: data.name,
            start_date: data.startDate,
            end_date: data.endDate,
            is_active: true,
          });

          await createTerm({
            session_id: sessionRes.id,
            name: data.term,
            start_date: data.startDate,
            end_date: data.endDate,
            is_active: true,
          });

          await get().fetchSessions();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      addNewTerm: async (sessionId, data) => {
        set({ loading: true, error: null });
        try {
          await createTerm({
            session_id: sessionId,
            name: data.name,
            start_date: data.startDate,
            end_date: data.endDate,
            is_active: data.isActive, 
          });
          await get().fetchSessions();
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

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
