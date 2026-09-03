import { create } from "zustand";
import type {
  AssessmentResponse,
  AssessmentRosterResponse,
  AssessmentScoresRequest,
} from "../api/teacherResults";
import {
  fetchTeacherAssessments,
  fetchAssessmentRoster,
  saveAssessmentScores,
  submitAssessmentScores
} from "../api/teacherResults";

interface GradeState {
  // We keep a cache of assessments by class+subject
  assessments: Record<string, AssessmentResponse[]>;
  
  // We keep a cache of rosters by assessmentId
  rosters: Record<string, AssessmentRosterResponse>;
  
  loading: boolean;
  error: string | null;

  loadAssessments: (classId: string, subjectId: string) => Promise<AssessmentResponse[]>;
  loadRoster: (assessmentId: string) => Promise<AssessmentRosterResponse>;
  saveScores: (assessmentId: string, payload: AssessmentScoresRequest) => Promise<void>;
  submitScores: (submissionId: string) => Promise<void>;
}

export const useGradeStore = create<GradeState>((set) => ({
  assessments: {},
  rosters: {},
  loading: false,
  error: null,

  loadAssessments: async (classId, subjectId) => {
    const key = `${classId}_${subjectId}`;
    try {
      set({ loading: true, error: null });
      const data = await fetchTeacherAssessments(classId, subjectId);
      set((state) => ({
        assessments: { ...state.assessments, [key]: data },
        loading: false,
      }));
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  loadRoster: async (assessmentId) => {
    try {
      set({ loading: true, error: null });
      const data = await fetchAssessmentRoster(assessmentId);
      set((state) => ({
        rosters: { ...state.rosters, [assessmentId]: data },
        loading: false,
      }));
      return data;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  saveScores: async (assessmentId, payload) => {
    try {
      set({ loading: true, error: null });
      await saveAssessmentScores(assessmentId, payload);
      // Reload the roster to get the latest saved scores and statuses
      const data = await fetchAssessmentRoster(assessmentId);
      set((state) => ({
        rosters: { ...state.rosters, [assessmentId]: data },
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  submitScores: async (submissionId) => {
    try {
      set({ loading: true, error: null });
      await submitAssessmentScores(submissionId);
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));
