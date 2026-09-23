import { create } from "zustand";
import { toast } from "sonner";
import {
  fetchMyParentProfile,
  fetchMyChildren,
  fetchMyChildResults,
  fetchMyChildAttendance,
  type LinkedStudentResponse,
  type ParentAttendanceResponse,
} from "../api/parentContext";
import { type ParentResponse } from "../api/parents";
import { type TermResultDetailResponse } from "../api/adminResults";

interface ParentContextState {
  profile: ParentResponse | null;
  children: LinkedStudentResponse[];
  selectedChildId: string | null;

  // Cached data per child
  childResults: Record<string, TermResultDetailResponse[]>;
  childAttendance: Record<string, ParentAttendanceResponse[]>;

  loadingProfile: boolean;
  loadingChildren: boolean;
  loadingResults: Record<string, boolean>;
  loadingAttendance: Record<string, boolean>;
  error: string | null;

  // Actions
  loadProfile: () => Promise<void>;
  loadChildren: () => Promise<void>;
  selectChild: (studentId: string) => void;
  loadChildResults: (studentId: string) => Promise<void>;
  loadChildAttendance: (studentId: string) => Promise<void>;
}

export const useParentContextStore = create<ParentContextState>((set, get) => ({
  profile: null,
  children: [],
  selectedChildId: null,

  childResults: {},
  childAttendance: {},

  loadingProfile: false,
  loadingChildren: false,
  loadingResults: {},
  loadingAttendance: {},
  error: null,

  loadProfile: async () => {
    set({ loadingProfile: true, error: null });
    try {
      const data = await fetchMyParentProfile();
      set({ profile: data, loadingProfile: false });
    } catch (error: any) {
      set({ error: error.message, loadingProfile: false });
      toast.error("Failed to load parent profile");
    }
  },

  loadChildren: async () => {
    set({ loadingChildren: true, error: null });
    try {
      const data = await fetchMyChildren();
      
      // Auto-select the first child if none is selected
      const currentSelected = get().selectedChildId;
      const newSelected = currentSelected && data.find((c) => c.id === currentSelected)
        ? currentSelected
        : data.length > 0 ? data[0].id : null;

      set({ children: data, selectedChildId: newSelected, loadingChildren: false });
      
      // Load results for the newly selected child
      if (newSelected) {
        get().loadChildResults(newSelected);
      }
    } catch (error: any) {
      set({ error: error.message, loadingChildren: false });
      toast.error("Failed to load children");
    }
  },

  selectChild: (studentId: string) => {
    set({ selectedChildId: studentId });
    // Pre-fetch results for this child if not already cached
    const state = get();
    if (!state.childResults[studentId]) {
      state.loadChildResults(studentId);
    }
  },

  loadChildResults: async (studentId: string) => {
    if (get().loadingResults[studentId]) return;
    
    set((state) => ({
      loadingResults: { ...state.loadingResults, [studentId]: true }
    }));
    
    try {
      const results = await fetchMyChildResults(studentId);
      set((state) => ({
        childResults: { ...state.childResults, [studentId]: results },
        loadingResults: { ...state.loadingResults, [studentId]: false }
      }));
    } catch (error: any) {
      set((state) => ({
        loadingResults: { ...state.loadingResults, [studentId]: false },
        error: error.message
      }));
    }
  },

  loadChildAttendance: async (studentId: string) => {
    if (get().loadingAttendance[studentId]) return;
    
    set((state) => ({
      loadingAttendance: { ...state.loadingAttendance, [studentId]: true }
    }));
    
    try {
      const attendance = await fetchMyChildAttendance(studentId);
      set((state) => ({
        childAttendance: { ...state.childAttendance, [studentId]: attendance },
        loadingAttendance: { ...state.loadingAttendance, [studentId]: false }
      }));
    } catch (error: any) {
      set((state) => ({
        loadingAttendance: { ...state.loadingAttendance, [studentId]: false },
        error: error.message
      }));
    }
  },
}));
