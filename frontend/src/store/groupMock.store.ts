import { create } from "zustand";

export interface ClassGroup {
  id: string;
  name: string;
}

interface GroupMockState {
  groups: ClassGroup[];
  addGroup: (name: string) => void;
  removeGroup: (id: string) => void;
  classGroupMap: Record<string, string>; // classId  groupId
  setClassGroup: (classId: string, groupId: string) => void;
  subjectGroupMap: Record<string, string[]>; // subjectId  groupId
  setSubjectGroups: (subjectId: string, groupIds: string[]) => void;
}

export const useGroupMockStore = create<GroupMockState>((set) => ({
  groups: [
    { id: "g1", name: "Senior Secondary (SSS 1-3)" },
    { id: "g2", name: "Junior Secondary (JSS 1-3)" },
  ],
  classGroupMap: {},
  subjectGroupMap: {},

  addGroup: (name) =>
    set((state) => ({
      groups: [...state.groups, { id: Math.random().toString(), name }],
    })),

  removeGroup: (id) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    })),

  setClassGroup: (classId, groupId) =>
    set((state) => ({
      classGroupMap: { ...state.classGroupMap, [classId]: groupId },
    })),

  setSubjectGroups: (subjectId, groupIds) =>
    set((state) => ({
      subjectGroupMap: { ...state.subjectGroupMap, [subjectId]: groupIds },
    })),
}));
