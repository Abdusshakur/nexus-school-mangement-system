import { create } from "zustand";
import { submitSchoolApplication, type SchoolApplicationPayload } from "../api/onboarding";
import { toast } from "sonner";

interface OnboardingState {
  currentStep: number;
  payload: Partial<SchoolApplicationPayload>;
  isSubmitting: boolean;
  error: string | null;

  setStep: (step: number) => void;
  updatePayload: (data: Partial<SchoolApplicationPayload>) => void;
  submitApplication: () => Promise<boolean>;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  currentStep: 1,
  payload: {
    country: "Nigeria",
    timezone: "Africa/Lagos",
  },
  isSubmitting: false,
  error: null,

  setStep: (step: number) => set({ currentStep: step }),

  updatePayload: (data) =>
    set((state) => ({
      payload: { ...state.payload, ...data },
      error: null,
    })),

  submitApplication: async () => {
    const { payload } = get();
    set({ isSubmitting: true, error: null });
    
    try {
      await submitSchoolApplication(payload as SchoolApplicationPayload);
      set({ isSubmitting: false });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to submit application. Please check your network and try again.";
      set({ error: msg, isSubmitting: false });
      toast.error(msg);
      return false;
    }
  },

  reset: () => set({ 
    currentStep: 1, 
    payload: {
      country: "Nigeria",
      timezone: "Africa/Lagos",
    }, 
    isSubmitting: false, 
    error: null 
  }),
}));
