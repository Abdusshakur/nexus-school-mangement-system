import { create } from "zustand";
import { fetchParentsList, type ParentResponse } from "../api/parents";

interface ParentState {
  parents: ParentResponse[];
  loading: boolean;
  error: string | null;
  fetchParents: (force?: boolean) => Promise<ParentResponse[]>;
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
    } catch (err: any) {
      const msg = err.message || "Failed to fetch parents list.";
      set({ error: msg, loading: false });
      throw err;
    }
  },
}));
