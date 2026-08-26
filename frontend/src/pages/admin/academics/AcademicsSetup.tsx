import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useSubjectStore } from "../../../store/subject.store";
import { toast } from "sonner";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
  const [activeTab, setActiveTab] = useState<"classes" | "subjects">("classes");

  const {
    classes,
    loading: classesLoading,
    loadClasses,
    addClass,
    removeClass,
  } = useClassStore();

  const {
    subjects,
    loading: subjectsLoading,
    loadSubjects,
    addSubject,
    removeSubject,
  } = useSubjectStore();

  const [newItemName, setNewItemName] = useState("");
  const [arm, setArm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, [loadClasses, loadSubjects]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setIsSubmitting(true);
    try {
      if (activeTab === "classes") {
        const finalName = arm
          ? `${newItemName.trim()} ${arm}`
          : newItemName.trim();
        await addClass(finalName);
        toast.success("Class added successfully");
      } else {
        await addSubject(newItemName.trim());
        toast.success("Subject added successfully");
      }
      setNewItemName("");
      setArm("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (activeTab === "classes") {
        await removeClass(deleteConfirm.id);
        toast.success("Class deleted successfully");
      } else {
        await removeSubject(deleteConfirm.id);
        toast.success("Subject deleted successfully");
      }
      setDeleteConfirm(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const currentItems = activeTab === "classes" ? classes : subjects;
  const isLoading = activeTab === "classes" ? classesLoading : subjectsLoading;

  return (
    <div className="p-6 max-w-5xl space-y-6">
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

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-150">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 shrink-0">
          <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("classes")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "classes"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              <Users size={18} />
              Classes
            </button>
            <button
              onClick={() => setActiveTab("subjects")}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "subjects"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-200/50"
              }`}
            >
              <BookOpen size={18} />
              Subjects
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 capitalize">
              Manage {activeTab}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === "classes"
                ? "Add or remove class streams (e.g. JSS 1, SS 3 Science)."
                : "Add or remove subjects offered in the school."}
            </p>
          </div>

          <form onSubmit={handleAdd} className="flex gap-3 mb-8">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter new ${activeTab.slice(0, -1)} name...`}
              className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50"
              disabled={isSubmitting}
            />
            {activeTab === "classes" && (
              <select
                value={arm}
                onChange={(e) => setArm(e.target.value)}
                className="w-32 md:w-40 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 cursor-pointer"
                disabled={isSubmitting}
              >
                <option value="">No Arm</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
                <option value="Science">Science</option>
                <option value="Commercial">Commercial</option>
                <option value="Arts">Arts</option>
              </select>
            )}
            <button
              type="submit"
              disabled={!newItemName.trim() || isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add
            </button>
          </form>

          {isLoading && currentItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Loader2
                size={32}
                className="animate-spin mb-4 text-indigo-500"
              />
              <p>Loading {activeTab}...</p>
            </div>
          ) : currentItems.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              {currentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                >
                  <span className="font-semibold text-slate-700">
                    {item.name}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title={`Delete ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <AlertCircle size={48} className="mb-4 text-slate-300" />
              <p className="font-medium text-slate-600">No {activeTab} found</p>
              <p className="text-sm mt-1 text-center max-w-xs">
                You haven't added any {activeTab} yet. Use the input above to
                create one.
              </p>
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <Modal
          title={`Delete ${activeTab === "classes" ? "Class" : "Subject"}`}
          onClose={() => setDeleteConfirm(null)}
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-xl">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p className="text-sm">
                Are you sure you want to delete{" "}
                <strong>{deleteConfirm.name}</strong>? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
