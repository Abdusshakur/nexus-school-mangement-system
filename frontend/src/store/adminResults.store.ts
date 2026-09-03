import { create } from "zustand";
import type {
  ScoreSubmission,
  SubmissionDetailsResponse,
} from "../api/adminResults";
import { adminResultsApi } from "../api/adminResults";
import { toast } from "sonner";

interface AdminResultsState {
  submissions: ScoreSubmission[];
  loadingSubmissions: boolean;

  submissionDetails: Record<string, SubmissionDetailsResponse>;
  loadingDetails: Record<string, boolean>;

  approvingId: string | null;
  error: string | null;

  loadSubmissions: () => Promise<void>;
  loadSubmissionDetails: (submissionId: string) => Promise<void>;
  approveScoreSubmission: (submissionId: string, className: string) => Promise<void>;
}

export const useAdminResultsStore = create<AdminResultsState>((set, get) => ({
  submissions: [],
  loadingSubmissions: false,
  submissionDetails: {},
  loadingDetails: {},
  approvingId: null,
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
}));
