import { create } from "zustand";
import { toast } from "sonner";
import type { ClassGroup, GroupSubject } from "../api/academics";
import {
  fetchClassGroups,
  createClassGroup,
  updateClassGroup,
  fetchGroupSubjects,
  assignGroupSubject,
  deactivateGroupSubject,
  fetchActiveSummary,
} from "../api/academics";

interface ClassGroupState {
  groups: ClassGroup[];
  groupSubjects: Record<string, GroupSubject[]>;
  loadingGroups: boolean;
  loadingContext: boolean;
  loadingSubjects: Record<string, boolean>;
  activeSessionId: string | null;
  activeTermId: string | null;

  // Actions
  fetchContext: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  createGroup: (
    name: string,
    description?: string,
  ) => Promise<ClassGroup | undefined>;
  updateGroup: (id: string, name: string) => Promise<void>;

  fetchGroupSubjects: (groupId: string) => Promise<void>;
  assignSubject: (groupId: string, subjectId: string) => Promise<void>;
  removeSubject: (groupSubjectId: string, groupId: string) => Promise<void>;

  assignSubjectToAllGroups: (subjectId: string) => Promise<void>;
}

export const useClassGroupStore = create<ClassGroupState>((set, get) => ({
  groups: [],
  groupSubjects: {},
  loadingGroups: false,
  loadingContext: false,
  loadingSubjects: {},
  activeSessionId: null,
  activeTermId: null,

  fetchContext: async () => {
    set({ loadingContext: true });
    try {
      const data = await fetchActiveSummary();
      set({
        activeSessionId: data.session_id,
        activeTermId: data.term_id,
        loadingContext: false,
      });
    } catch (err: any) {
      console.error("Failed to load active context:", err);
      set({ loadingContext: false });
    }
  },

  fetchGroups: async () => {
    set({ loadingGroups: true });
    try {
      const data = await fetchClassGroups();
      set({ groups: data, loadingGroups: false });
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to load class groups.");
      set({ loadingGroups: false });
    }
  },

  createGroup: async (name: string, description?: string) => {
    try {
      const newGroup = await createClassGroup({ name, description });
      set((state) => ({ groups: [...state.groups, newGroup] }));
      toast.success(`${name} created successfully.`);
      return newGroup;
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to create class group.",
      );
    }
  },

  updateGroup: async (id: string, name: string) => {
    try {
      const updated = await updateClassGroup(id, { name });
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g)),
      }));
      toast.success("Group updated successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to update class group.",
      );
    }
  },

  fetchGroupSubjects: async (groupId: string) => {
    const { activeSessionId, activeTermId } = get();
    if (!activeSessionId || !activeTermId) {
      await get().fetchContext(); // attempt to load context if missing
      const freshState = get();
      if (!freshState.activeSessionId || !freshState.activeTermId) return; // unable to load
    }

    set((state) => ({
      loadingSubjects: { ...state.loadingSubjects, [groupId]: true },
    }));
    try {
      const { activeSessionId, activeTermId } = get();
      const subjects = await fetchGroupSubjects(
        groupId,
        activeSessionId!,
        activeTermId!,
      );
      set((state) => ({
        groupSubjects: { ...state.groupSubjects, [groupId]: subjects },
        loadingSubjects: { ...state.loadingSubjects, [groupId]: false },
      }));
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail || "Failed to load subjects for group.",
      );
      set((state) => ({
        loadingSubjects: { ...state.loadingSubjects, [groupId]: false },
      }));
    }
  },

  assignSubject: async (groupId: string, subjectId: string) => {
    const { activeSessionId, activeTermId } = get();
    if (!activeSessionId || !activeTermId) {
      toast.error(
        "No active academic session/term found. Cannot assign subjects.",
      );
      return;
    }
    try {
      const result = await assignGroupSubject(groupId, {
        subject_id: subjectId,
        academic_session_id: activeSessionId,
        academic_term_id: activeTermId,
        is_required: true,
      });
      set((state) => ({
        groupSubjects: {
          ...state.groupSubjects,
          [groupId]: [...(state.groupSubjects[groupId] || []), result],
        },
      }));
      toast.success("Subject assigned to group.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to assign subject.");
    }
  },

  removeSubject: async (groupSubjectId: string, groupId: string) => {
    try {
      await deactivateGroupSubject(groupSubjectId);
      set((state) => ({
        groupSubjects: {
          ...state.groupSubjects,
          [groupId]: (state.groupSubjects[groupId] || []).filter(
            (s) => s.id !== groupSubjectId,
          ),
        },
      }));
      toast.success("Subject removed from group.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to remove subject.");
    }
  },

  assignSubjectToAllGroups: async (subjectId: string) => {
    const { activeSessionId, activeTermId, groups } = get();
    if (!activeSessionId || !activeTermId) {
      toast.error("No active academic session/term found.");
      return;
    }
    if (groups.length === 0) return;

    try {
      // Run assignments in parallel
      const promises = groups.map((g) =>
        assignGroupSubject(g.id, {
          subject_id: subjectId,
          academic_session_id: activeSessionId,
          academic_term_id: activeTermId,
          is_required: true,
        }).catch((err) => {
          console.warn(
            `Skipped assignment for group ${g.name}:`,
            err.response?.data?.detail,
          );
          return null;
        }),
      );

      await Promise.all(promises);
      toast.success("Subject applied to all class groups.");

      // Refresh all loaded subject lists to keep UI synced
      const loadedGroupIds = Object.keys(get().groupSubjects);
      loadedGroupIds.forEach((gid) => get().fetchGroupSubjects(gid));
    } catch (err: any) {
      toast.error("Failed to apply subject to all groups.");
    }
  },
}));
