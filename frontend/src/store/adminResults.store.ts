import { create } from "zustand";
import type {
  ScoreSubmission,
  SubmissionDetailsResponse,
  TermResultDetailResponse,
} from "../api/adminResults";
import { adminResultsApi } from "../api/adminResults";
import { toast } from "sonner";

interface AdminResultsState {
  submissions: ScoreSubmission[];
  loadingSubmissions: boolean;

  submissionDetails: Record<string, SubmissionDetailsResponse>;
  loadingDetails: Record<string, boolean>;

  approvingId: string | null;
  rejectingId: string | null;
  error: string | null;

  loadSubmissions: () => Promise<void>;
  loadSubmissionDetails: (submissionId: string) => Promise<void>;
  approveScoreSubmission: (submissionId: string, className: string) => Promise<void>;
  rejectScoreSubmission: (submissionId: string, className: string, reason: string) => Promise<void>;

  // Term Results & Publication
  termPublicationStatus: Record<string, "DRAFT" | "PUBLISHED" | "LOCKED">;
  classResults: Record<string, TermResultDetailResponse[]>;
  loadingPublication: Record<string, boolean>;
  loadingClassResults: Record<string, boolean>;
  
  loadTermPublicationStatus: (termId: string) => Promise<void>;
  publishTermResults: (termId: string) => Promise<void>;
  lockTermResults: (termId: string) => Promise<void>;
  loadClassResults: (classId: string, termId: string) => Promise<void>;
}

export const useAdminResultsStore = create<AdminResultsState>((set, get) => ({
  submissions: [],
  loadingSubmissions: false,
  submissionDetails: {},
  loadingDetails: {},
  approvingId: null,
  rejectingId: null,
  error: null,

  loadSubmissions: async () => {
    set({ loadingSubmissions: true, error: null });
    try {
      const data = await adminResultsApi.fetchSubmissions();
      
      set({ submissions: data || [], loadingSubmissions: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to load submissions",
        loadingSubmissions: false,
      });
      toast.error("Failed to load submissions");
    }
  },

  loadSubmissionDetails: async (submissionId: string) => {

    if (get().submissionDetails[submissionId]) return;

    set((state) => ({
      loadingDetails: { ...state.loadingDetails, [submissionId]: true },
    }));



    try {
      const data = await adminResultsApi.fetchSubmissionDetails(submissionId);
      set((state) => ({
        submissionDetails: { ...state.submissionDetails, [submissionId]: data },
        loadingDetails: { ...state.loadingDetails, [submissionId]: false },
      }));
    } catch (err: any) {
      set((state) => ({
        loadingDetails: { ...state.loadingDetails, [submissionId]: false },
      }));
      toast.error("Failed to load submission details");
    }
  },

  approveScoreSubmission: async (submissionId: string, className: string) => {
    set({ approvingId: submissionId });
    try {
      const updatedSubmission = await adminResultsApi.approveSubmission(submissionId);

      set((state) => ({
        submissions: state.submissions.map((s) =>
          s.id === submissionId ? updatedSubmission : s
        ),
        approvingId: null,
      }));

      toast.success(`Scores for ${className} have been approved!`);
    } catch (err: any) {
      set({ approvingId: null });
      toast.error(err.response?.data?.message || "Failed to approve scores");
    }
  },

  rejectScoreSubmission: async (submissionId: string, className: string, reason: string) => {
    set({ rejectingId: submissionId });
    try {
      const updatedSubmission = await adminResultsApi.rejectSubmission(submissionId, reason);

      set((state) => ({
        submissions: state.submissions.map((s) =>
          s.id === submissionId ? updatedSubmission : s
        ),
        rejectingId: null,
      }));

      toast.success(`Scores for ${className} have been rejected.`);
    } catch (err: any) {
      set({ rejectingId: null });
      toast.error(err.response?.data?.message || "Failed to reject scores");
    }
  },

  // Term Results & Publication Implementation
  termPublicationStatus: {},
  classResults: {},
  loadingPublication: {},
  loadingClassResults: {},

  loadTermPublicationStatus: async (termId) => {
    set((state) => ({
      loadingPublication: { ...state.loadingPublication, [termId]: true },
    }));
    try {
      const res = await adminResultsApi.getTermPublicationStatus(termId);
      set((state) => ({
        termPublicationStatus: {
          ...state.termPublicationStatus,
          [termId]: res.status,
        },
      }));
    } catch (error: any) {
      set((state) => ({
        termPublicationStatus: {
          ...state.termPublicationStatus,
          [termId]: "DRAFT",
        },
      }));
    } finally {
      set((state) => ({
        loadingPublication: { ...state.loadingPublication, [termId]: false },
      }));
    }
  },

  publishTermResults: async (termId) => {
    set((state) => ({
      loadingPublication: { ...state.loadingPublication, [termId]: true },
    }));
    try {
      await adminResultsApi.publishTermResults(termId);
      set((state) => ({
        termPublicationStatus: {
          ...state.termPublicationStatus,
          [termId]: "PUBLISHED",
        },
      }));
      toast.success("Term results published successfully!");
    } catch (error: any) {
      throw error;
    } finally {
      set((state) => ({
        loadingPublication: { ...state.loadingPublication, [termId]: false },
      }));
    }
  },

  lockTermResults: async (termId) => {
    set((state) => ({
      loadingPublication: { ...state.loadingPublication, [termId]: true },
    }));
    try {
      await adminResultsApi.lockTermResults(termId);
      set((state) => ({
        termPublicationStatus: {
          ...state.termPublicationStatus,
          [termId]: "LOCKED",
        },
      }));
      toast.success("Term results locked successfully!");
    } catch (error: any) {
      throw error;
    } finally {
      set((state) => ({
        loadingPublication: { ...state.loadingPublication, [termId]: false },
      }));
    }
  },

  loadClassResults: async (classId, termId) => {
    const key = `${classId}-${termId}`;
    set((state) => ({
      loadingClassResults: { ...state.loadingClassResults, [key]: true },
    }));
    try {
      const data = await adminResultsApi.getClassTermResults(classId, termId);
      set((state) => ({
        classResults: {
          ...state.classResults,
          [key]: data,
        },
      }));
    } catch (error: any) {
      set((state) => ({
        classResults: {
          ...state.classResults,
          [key]: [],
        },
      }));
    } finally {
      set((state) => ({
        loadingClassResults: { ...state.loadingClassResults, [key]: false },
      }));
    }
  },
}));
