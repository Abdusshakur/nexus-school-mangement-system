import { create } from "zustand";
import {
  fetchParentsList,
  createParent,
  linkParentToStudent,
  updateParentProfile,
  type ParentResponse,
  type ParentCreatePayload,
  type RelationshipCreatePayload,
  type RelationshipResponse,
} from "../api/parents";

interface ParentState {
  parents: ParentResponse[];
  loading: boolean;
  error: string | null;
  fetchParents: (force?: boolean) => Promise<ParentResponse[]>;
  addParent: (payload: ParentCreatePayload) => Promise<ParentResponse>;
  linkParent: (
    payload: RelationshipCreatePayload,
  ) => Promise<RelationshipResponse>;
  updateParent: (
    id: string,
    payload: Partial<ParentCreatePayload>,
  ) => Promise<any>;
}

export const useParentStore = create<ParentState>((set, get) => ({
  parents: [],
  loading: false,
  error: null,

  fetchParents: async (force = false) => {
    const current = get().parents;
    if (current.length > 0 && !force) return current;

    set({ loading: true, error: null });
    try {
      const data = await fetchParentsList();
      set({ parents: data, loading: false });
      return data;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch parents list.";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  addParent: async (payload) => {
    set({ loading: true, error: null });
    try {
      const newParent = await createParent(payload);
      newParent.children = [];
      set((state) => ({
        parents: [newParent, ...state.parents],
        loading: false,
      }));
      return newParent;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to create parent profile.";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  linkParent: async (payload) => {
    set({ loading: true, error: null });
    try {
      const result = await linkParentToStudent(payload);
      // Fetch parent-student list to update mapped children
      const data = await fetchParentsList();
      set({ parents: data, loading: false });
      return result;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to link parent to student.";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  updateParent: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      await updateParentProfile(id, payload);
      // Fetch parent list to update mapped array
      const data = await fetchParentsList();
      set({ parents: data, loading: false });
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update parent profile.";
      set({ error: msg, loading: false });
      throw err;
    }
  },
}));
