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
  AssessmentSchemeTemplateResponse,
  AssessmentSchemeTemplateCreate,
  AssessmentSchemeTemplateUpdate,
  AssessmentTemplateComponentResponse,
  AssessmentTemplateComponentCreate,
} from "../api/resultsConfig";
import {
  fetchSchemes,
  createScheme,
  updateScheme,
  fetchSchemeAssessments,
  addAssessmentComponent,
  fetchGradingScales,
  createGradingScale,
  updateGradingScale,
  fetchGradingRules,
  addGradingRule,
  updateGradingRule,
  fetchSchemeTemplates,
  createSchemeTemplate,
  updateSchemeTemplate,
  fetchTemplateComponents,
  addTemplateComponent,
  activateSchemeTemplate,
  applySchemeTemplate,
} from "../api/resultsConfig";

interface ResultsConfigState {
  schemes: AssessmentSchemeResponse[];
  components: Record<string, AssessmentComponentResponse[]>; // schemeId components
  gradingScales: GradingScaleResponse[];
  gradingRules: Record<string, GradingRuleResponse[]>; // scaleId rules
  schemeTemplates: AssessmentSchemeTemplateResponse[];
  templateComponents: Record<string, AssessmentTemplateComponentResponse[]>; // templateId -> components
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

  loadSchemeTemplates: () => Promise<void>;
  createNewSchemeTemplate: (
    payload: AssessmentSchemeTemplateCreate,
  ) => Promise<AssessmentSchemeTemplateResponse>;
  editSchemeTemplate: (
    templateId: string,
    payload: AssessmentSchemeTemplateUpdate,
  ) => Promise<AssessmentSchemeTemplateResponse>;
  activateTemplate: (templateId: string) => Promise<AssessmentSchemeTemplateResponse>;
  applyTemplate: (templateId: string, sessionId: string, termId: string) => Promise<{ created: number; skipped: number }>;

  loadTemplateComponents: (templateId: string) => Promise<AssessmentTemplateComponentResponse[]>;
  addTemplateComponent: (templateId: string, payload: AssessmentTemplateComponentCreate) => Promise<AssessmentTemplateComponentResponse>;

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

export const useResultsConfigStore = create<ResultsConfigState>((set) => ({
  schemes: [],
  components: {},
  gradingScales: [],
  gradingRules: {},
  schemeTemplates: [],
  templateComponents: {},
  loading: false,
  error: null,

  loadSchemes: async () => {
    set({ loading: true, error: null });
    try {
      const schemes = await fetchSchemes();
      set({ schemes, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  loadSchemeTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const templates = await fetchSchemeTemplates();
      set({ schemeTemplates: templates, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createNewSchemeTemplate: async (payload) => {
    set({ loading: true });
    try {
      const newTemplate = await createSchemeTemplate(payload);
      set((state) => ({
        schemeTemplates: [newTemplate, ...state.schemeTemplates],
        templateComponents: { ...state.templateComponents, [newTemplate.id]: [] },
        loading: false,
      }));
      return newTemplate;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  editSchemeTemplate: async (templateId, payload) => {
    const updated = await updateSchemeTemplate(templateId, payload);
    set((state) => ({
      schemeTemplates: state.schemeTemplates.map((t) => (t.id === templateId ? updated : t)),
    }));
    return updated;
  },

  activateTemplate: async (templateId) => {
    const activated = await activateSchemeTemplate(templateId);
    set((state) => ({
      schemeTemplates: state.schemeTemplates.map((t) => (t.id === templateId ? activated : t)),
    }));
    return activated;
  },

  applyTemplate: async (templateId, sessionId, termId) => {
    return applySchemeTemplate(templateId, sessionId, termId);
  },

  loadTemplateComponents: async (templateId) => {
    try {
      const components = await fetchTemplateComponents(templateId);
      set((state) => ({
        templateComponents: { ...state.templateComponents, [templateId]: components },
      }));
      return components;
    } catch (err) {
      return [];
    }
  },

  addTemplateComponent: async (templateId, payload) => {
    const newComponent = await addTemplateComponent(templateId, payload);
    set((state) => {
      const existing = state.templateComponents[templateId] || [];
      return {
        templateComponents: {
          ...state.templateComponents,
          [templateId]: [...existing, newComponent].sort(
            (a, b) => a.sequence - b.sequence,
          ),
        },
      };
    });
    return newComponent;
  },

  createNewScheme: async (payload) => {
    set({ loading: true });
    try {
      const newScheme = await createScheme(payload);
      set((state) => ({
        schemes: [...state.schemes, newScheme],
        components: { ...state.components, [newScheme.id]: [] },
        loading: false,
      }));
      return newScheme;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  editScheme: async (schemeId, payload) => {
    const updated = await updateScheme(schemeId, payload);
    set((state) => ({
      schemes: state.schemes.map((s) => (s.id === schemeId ? updated : s)),
    }));
    return updated;
  },

  loadSchemeComponents: async (schemeId: string) => {
    try {
      const components = await fetchSchemeAssessments(schemeId);
      set((state) => ({
        components: { ...state.components, [schemeId]: components },
      }));
      return components;
    } catch (err) {
      return [];
    }
  },

  addSchemeComponent: async (schemeId, payload) => {
    const newComponent = await addAssessmentComponent(schemeId, payload);
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
    set({ loading: true, error: null });
    try {
      const scales = await fetchGradingScales();
      set({ gradingScales: scales, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createNewGradingScale: async (payload) => {
    const newScale = await createGradingScale(payload);
    set((state) => ({ gradingScales: [newScale, ...state.gradingScales], loading: false }));
    return newScale;
  },

  editGradingScale: async (scaleId, payload) => {
    const updated = await updateGradingScale(scaleId, payload);
    set(state => ({
      gradingScales: state.gradingScales.map(s => s.id === scaleId ? updated : s)
    }));
    return updated;
  },

  loadGradingRules: async (scaleId: string) => {
    try {
      const rules = await fetchGradingRules(scaleId);
      set((state) => ({
        gradingRules: { ...state.gradingRules, [scaleId]: rules },
      }));
      return rules;
    } catch (err) {
      return [];
    }
  },

  createNewGradingRule: async (scaleId: string, payload: GradingRuleCreate) => {
    const newRule = await addGradingRule(scaleId, payload);
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
    const updatedRule = await updateGradingRule(ruleId, payload);
    set(state => {
      const currentRules = { ...state.gradingRules };
      for (const scaleId in currentRules) {
        const ruleIdx = currentRules[scaleId].findIndex(r => r.id === ruleId);
        if (ruleIdx !== -1) {
          currentRules[scaleId][ruleIdx] = updatedRule;
          currentRules[scaleId].sort((a, b) => b.minimum_percentage - a.minimum_percentage);
          break;
        }
      }
      return { gradingRules: currentRules };
    });
    return updatedRule;
  }
}));
