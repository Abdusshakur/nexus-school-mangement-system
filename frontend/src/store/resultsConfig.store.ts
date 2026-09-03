import { create } from "zustand";
import type {
  AssessmentSchemeResponse,
  AssessmentComponentResponse,
  GradingScaleResponse,
  AssessmentSchemeCreate,
  AssessmentSchemeUpdate,
  AssessmentComponentCreate,
  GradingScaleCreate,
  GradingScaleUpdate,
  GradingRuleResponse,
  GradingRuleCreate,
  GradingRuleUpdate,
} from "../api/resultsConfig";


interface ResultsConfigState {
  schemes: AssessmentSchemeResponse[];
  components: Record<string, AssessmentComponentResponse[]>; // schemeId 
  gradingScales: GradingScaleResponse[];
  gradingRules: Record<string, GradingRuleResponse[]>; // scaleId rules
  loading: boolean;
  error: string | null;

  loadSchemes: () => Promise<void>;
  createNewScheme: (
    payload: AssessmentSchemeCreate,
  ) => Promise<AssessmentSchemeResponse>;
  editScheme: (
    schemeId: string,
    payload: AssessmentSchemeUpdate,
  ) => Promise<AssessmentSchemeResponse>;

  loadSchemeComponents: (
    schemeId: string,
  ) => Promise<AssessmentComponentResponse[]>;
  addSchemeComponent: (
    schemeId: string,
    payload: AssessmentComponentCreate,
  ) => Promise<AssessmentComponentResponse>;

  loadGradingScales: () => Promise<void>;
  createNewGradingScale: (
    payload: GradingScaleCreate,
  ) => Promise<GradingScaleResponse>;
  editGradingScale: (
    scaleId: string,
    payload: GradingScaleUpdate,
  ) => Promise<GradingScaleResponse>;

  loadGradingRules: (scaleId: string) => Promise<GradingRuleResponse[]>;
  createNewGradingRule: (
    scaleId: string,
    payload: GradingRuleCreate,
  ) => Promise<GradingRuleResponse>;
  editGradingRule: (
    ruleId: string,
    payload: GradingRuleUpdate,
  ) => Promise<GradingRuleResponse>;
}

export const useResultsConfigStore = create<ResultsConfigState>((set, get) => ({
  schemes: [
    {
      id: "mock-scheme-1",
      school_id: "school-1",
      academic_session_id: "session-1",
      academic_term_id: "term-1",
      class_id: "",
      class_name: "",
      subject_id: "",
      subject_name: "",
      academic_session_name: "2026/2027",
      academic_term_name: "First Term",
      name: "Default Global Scheme",
      total_weight: 100,
      status: "DRAFT",
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  components: {
    "mock-scheme-1": [
      {
        id: "comp-1",
        scheme_id: "mock-scheme-1",
        name: "First CA",
        type: "CONTINUOUS_ASSESSMENT",
        max_score: 20,
        weight: 20,
        sequence: 1,
        is_required: true,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  gradingScales: [],
  gradingRules: {},
  loading: false,
  error: null,

  loadSchemes: async () => {
    // Mock load
    set({ loading: false });
  },

  createNewScheme: async (payload) => {
    set({ loading: true });

    const newScheme: AssessmentSchemeResponse = {
      id: "mock-" + Math.random().toString(36).substring(7),
      school_id: "school-1",
      academic_session_id: payload.academic_session_id,
      academic_term_id: payload.academic_term_id,
      class_id: payload.class_id || "",
      class_name: "",
      subject_id: payload.subject_id || "",
      subject_name: "",
      academic_session_name: "2026/2027",
      academic_term_name: "First Term",
      name: payload.name,
      total_weight: payload.total_weight,
      status: payload.status,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTimeout(() => {
      set((state) => ({
        schemes: [...state.schemes, newScheme],
        components: { ...state.components, [newScheme.id]: [] },
        loading: false,
      }));
    }, 500);

    return newScheme;
  },

  editScheme: async (schemeId, payload) => {
    // Mock update
    const updated = {
      ...get().schemes.find((s) => s.id === schemeId)!,
      ...payload,
    } as AssessmentSchemeResponse;
    set((state) => ({
      schemes: state.schemes.map((s) => (s.id === schemeId ? updated : s)),
    }));
    return updated;
  },

  loadSchemeComponents: async (schemeId: string) => {
    return get().components[schemeId] || [];
  },

  addSchemeComponent: async (schemeId, payload) => {
    const newComponent: AssessmentComponentResponse = {
      id: "comp-" + Math.random().toString(36).substring(7),
      scheme_id: schemeId,
      name: payload.name,
      type: payload.type,
      max_score: payload.max_score,
      weight: payload.weight,
      sequence: payload.sequence,
      is_required: payload.is_required,
      status: payload.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    set((state) => {
      const existing = state.components[schemeId] || [];
      return {
        components: {
          ...state.components,
          [schemeId]: [...existing, newComponent].sort(
            (a, b) => a.sequence - b.sequence,
          ),
        },
      };
    });

    return newComponent;
  },

  loadGradingScales: async () => {
    // Just resolve immediately using local mock data
    set({ loading: false });
  },

  createNewGradingScale: async (payload) => {
    const newScale: GradingScaleResponse = {
      id: "scale-" + Math.random().toString(36).substring(7),
      school_id: "school-1",
      name: payload.name,
      academic_session_id: payload.academic_session_id,
      academic_term_id: payload.academic_term_id,
      version: payload.version || 1,
      is_active: payload.is_active || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    set((state) => ({ gradingScales: [newScale, ...state.gradingScales], loading: false }));
    return newScale;
  },

  editGradingScale: async (scaleId, payload) => {
    const updated = { ...get().gradingScales.find(s => s.id === scaleId)!, ...payload } as GradingScaleResponse;
    set(state => ({
      gradingScales: state.gradingScales.map(s => s.id === scaleId ? updated : s)
    }));
    return updated;
  },

  loadGradingRules: async (scaleId: string) => {
    return get().gradingRules?.[scaleId] || [];
  },

  createNewGradingRule: async (scaleId: string, payload: GradingRuleCreate) => {
    const newRule: GradingRuleResponse = {
      id: "rule-" + Math.random().toString(36).substring(7),
      grading_scale_id: scaleId,
      grade: payload.grade,
      minimum_percentage: payload.minimum_percentage,
      maximum_percentage: payload.maximum_percentage,
      remark: payload.remark || "",
    };

    set(state => {
      const currentRules = state.gradingRules || {};
      const existing = currentRules[scaleId] || [];
      return {
        gradingRules: {
          ...currentRules,
          [scaleId]: [...existing, newRule].sort((a, b) => b.minimum_percentage - a.minimum_percentage)
        }
      };
    });

    return newRule;
  },

  editGradingRule: async (ruleId: string, payload: GradingRuleUpdate) => {
    // Mock implementation for edit
    let updatedRule: GradingRuleResponse | null = null;
    set(state => {
      const currentRules = { ...state.gradingRules };
      for (const scaleId in currentRules) {
        const ruleIdx = currentRules[scaleId].findIndex(r => r.id === ruleId);
        if (ruleIdx !== -1) {
          const rule = currentRules[scaleId][ruleIdx];
          updatedRule = { ...rule, ...payload } as GradingRuleResponse;
          currentRules[scaleId][ruleIdx] = updatedRule;
          currentRules[scaleId].sort((a, b) => b.minimum_percentage - a.minimum_percentage);
          break;
        }
      }
      return { gradingRules: currentRules };
    });
    if (!updatedRule) throw new Error("Rule not found");
    return updatedRule;
  }
}));
