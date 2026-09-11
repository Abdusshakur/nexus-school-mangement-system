import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Plus,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
  CheckCircle,
  FolderTree,
} from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useSubjectStore } from "../../../store/subject.store";
import { useClassGroupStore } from "../../../store/classGroup.store";
import { toast } from "sonner";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ScoreApprovalsTab } from "./ScoreApprovalsTab";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-[17px] text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function AcademicsSetup() {
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "approvals">("classes");

  const {
    groups,
    groupSubjects,
    loadingGroups,
    loadingSubjects,
    fetchGroups,
    createGroup,
    updateGroup,
    fetchGroupSubjects,
    assignSubject,
    removeSubject,
    assignSubjectToAllGroups
  } = useClassGroupStore();

  const [selectedGroup, setSelectedGroup] = useState("");

  const {
    classes,
    loading: classesLoading,
    loadClasses,
    addClass,
    removeClass,
    editClass,
  } = useClassStore();

  const {
    subjects,
    loading: globalSubjectsLoading,
    loadSubjects,
    addSubject,
  } = useSubjectStore();

  const [newGroupName, setNewGroupName] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [applyToAll, setApplyToAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    groupId?: string;
    name: string;
    type: "class" | "subject";
  } | null>(null);

  const [editModal, setEditModal] = useState<{ id: string, name: string, type: "class" | "group" } | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchGroups();
    loadClasses();
    loadSubjects();
  }, [fetchGroups, loadClasses, loadSubjects]);

  useEffect(() => {
    if (activeTab === "subjects" && selectedGroup) {
      fetchGroupSubjects(selectedGroup);
    }
  }, [activeTab, selectedGroup, fetchGroupSubjects]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsSubmitting(true);
    await createGroup(newGroupName.trim());
    setNewGroupName("");
    setIsSubmitting(false);
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim() || !selectedGroup) return;
    setIsSubmitting(true);
    await addClass(newClassName.trim().toUpperCase(), selectedGroup);
    toast.success("Class created successfully!");
    setNewClassName("");
    setIsSubmitting(false);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return;
    if (!applyToAll && !selectedGroup) {
      toast.error("Please select a group or check 'Apply to all'.");
      return;
    }

    setIsSubmitting(true);
    try {
      let subjectId = "";
      const existing = subjects.find(s => s.name.toLowerCase() === newSubjectName.trim().toLowerCase());

      if (existing) {
        subjectId = existing.id;
      } else {
        // Create subject globally if it doesn't exist
        const newSubject = await addSubject(newSubjectName.trim());
        subjectId = newSubject.id;
      }

      // Assign it to class groups
      if (applyToAll) {
        await assignSubjectToAllGroups(subjectId);
      } else if (selectedGroup) {
        await assignSubject(selectedGroup, subjectId);
      }

      setNewSubjectName("");
      setApplyToAll(false);
    } catch (err) {
      // handled in store
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsSubmitting(true);
    try {
      if (deleteConfirm.type === "class") {
        await removeClass(deleteConfirm.id);
        toast.success("Class deleted successfully");
      } else if (deleteConfirm.type === "subject" && deleteConfirm.groupId) {
        await removeSubject(deleteConfirm.id, deleteConfirm.groupId);
      }
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editModal || !editValue.trim() || editValue.trim() === editModal.name) {
      setEditModal(null);
      return;
    }
    setIsSubmitting(true);
    try {
      if (editModal.type === "class") {
        await editClass(editModal.id, editValue.trim().toUpperCase());
        toast.success("Class updated successfully");
      } else if (editModal.type === "group") {
        await updateGroup(editModal.id, editValue.trim());
      }
      setEditModal(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedClasses = classes.filter(c => c.group_id === selectedGroup);
  const displayedSubjects = groupSubjects[selectedGroup] || [];
  const isSubjectsLoading = loadingSubjects[selectedGroup] || false;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Academic Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your classes and subjects.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        {/* Sidebar Tab */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => { setActiveTab("classes"); setSelectedGroup(""); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "classes"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/50"
                }`}
            >
              <Users size={18} />
              Classes
            </button>
            <button
              onClick={() => { setActiveTab("subjects"); setSelectedGroup(""); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "subjects"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/50"
                }`}
            >
              <BookOpen size={18} />
              Subjects
            </button>
            <button
              onClick={() => setActiveTab("approvals")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === "approvals"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 hover:bg-slate-200/50"
                }`}
            >
              <CheckCircle size={18} />
              Score Approvals
            </button>
          </nav>
        </div>


        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              Manage {activeTab}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "classes" && "Add class groups (e.g. Junior Secondary) and create classes under them."}
              {activeTab === "subjects" && "Add subjects to class groups. Universal subjects can be applied to all groups at once."}
              {activeTab === "approvals" && "Review and approve subject scores submitted by teachers."}
            </p>
          </div>

          {activeTab === "approvals" ? (
            <ScoreApprovalsTab />
          ) : (
            <div className="flex flex-col md:flex-row gap-8 h-full min-h-[600px]">
              {/* Groups List*/}
              <div className="w-full md:w-1/2 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800 mb-3">Class Groups</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="e.g. Junior Secondary"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim() || isSubmitting}
                      className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {loadingGroups ? (
                    <div className="space-y-2 p-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : groups.length === 0 ? (
                    <p className="text-center text-sm text-slate-400 mt-4">No groups created yet.</p>
                  ) : (
                    groups.map(group => (
                      <div
                        key={group.id}
                        className={`p-3 rounded-lg flex items-center justify-between cursor-pointer mb-1 transition-colors group/item ${selectedGroup === group.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"
                          }`}
                        onClick={() => setSelectedGroup(group.id)}
                      >
                        <span className={`font-medium ${selectedGroup === group.id ? "text-indigo-700" : "text-slate-700"}`}>
                          {group.name}
                        </span>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setEditModal({ id: group.id, name: group.name, type: "group" });
                          setEditValue(group.name);
                        }} className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover/item:opacity-100 transition-opacity p-1">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detail List (Classes or Subjects) */}
              <div className="w-full md:w-1/2 flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white">
                {selectedGroup ? (
                  <>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 mb-3">
                        {activeTab === "classes" ? "Classes in " : "Subjects in "}
                        <span className="text-indigo-600">{groups.find(g => g.id === selectedGroup)?.name}</span>
                      </h3>

                      {activeTab === "classes" ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            placeholder="e.g. JSS 1A"
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={handleCreateClass}
                            disabled={!newClassName.trim() || isSubmitting}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newSubjectName}
                              onChange={(e) => setNewSubjectName(e.target.value)}
                              placeholder="e.g. Mathematics"
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                            />
                            <button
                              onClick={handleCreateSubject}
                              disabled={!newSubjectName.trim() || isSubmitting}
                              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer w-fit text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={applyToAll}
                              onChange={(e) => setApplyToAll(e.target.checked)}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600"
                            />
                            Apply to all class groups
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                      {activeTab === "classes" ? (
                        classesLoading ? (
                          <div className="space-y-2 p-2">
                            {[1, 2, 3, 4].map((i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : (
                          <>
                            {displayedClasses.length === 0 && (
                              <p className="text-center text-sm text-slate-400 mt-4">No classes in this group.</p>
                            )}
                            {displayedClasses.map(c => (
                              <div key={c.id} className="p-3 rounded-lg flex items-center justify-between hover:bg-slate-50 mb-1 group/item border border-transparent hover:border-slate-100">
                                <span className="font-medium text-slate-700">{c.name}</span>
                                <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                  <button onClick={() => {
                                    setEditModal({ id: c.id, name: c.name, type: "class" });
                                    setEditValue(c.name);
                                  }} className="text-slate-400 hover:text-indigo-600 p-1">
                                    <Edit2 size={16} />
                                  </button>
                                  <button onClick={() => setDeleteConfirm({ id: c.id, name: c.name, type: "class" })} className="text-slate-400 hover:text-red-500 p-1">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}


                          </>
                        )
                      ) : (
                        isSubjectsLoading || globalSubjectsLoading ? (
                          <div className="space-y-2 p-2">
                            {[1, 2, 3, 4].map((i) => (
                              <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : displayedSubjects.length === 0 ? (
                          <p className="text-center text-sm text-slate-400 mt-4">No subjects in this group.</p>
                        ) : (
                          displayedSubjects.map(s => (
                            <div key={s.id} className="p-3 rounded-lg flex items-center justify-between hover:bg-slate-50 mb-1 group/item border border-transparent hover:border-slate-100">
                              <span className="font-medium text-slate-700">{s.subject_name}</span>
                            </div>
                          ))
                        )
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <FolderTree size={32} className="text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">Select a Class Group</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Click on a group to view and manage its {activeTab === "classes" ? "classes" : "subjects"}.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <Modal
          title={`Delete ${deleteConfirm.type === "class" ? "Class" : "Subject"}`}
          onClose={() => setDeleteConfirm(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-xl">
              <AlertTriangle className="shrink-0 mt-0.5" size={20} />
              <div className="text-sm">
                <p className="font-semibold">Are you sure?</p>
                <p className="mt-1 opacity-90">
                  {deleteConfirm.type === "class"
                    ? `Deleting ${deleteConfirm.name} cannot be undone.`
                    : `Removing ${deleteConfirm.name} from this group cannot be undone.`
                  }
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {editModal && (
        <Modal
          title={`Edit ${editModal.type === "class" ? "Class" : "Group"}`}
          onClose={() => setEditModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting || !editValue.trim() || editValue.trim() === editModal.name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
