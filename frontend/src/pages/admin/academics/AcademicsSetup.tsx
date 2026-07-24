import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useSubjectStore } from "../../../store/subject.store";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await addClass(newItemName.trim());
        toast.success("Class added successfully");
      } else {
        await addSubject(newItemName.trim());
        toast.success("Subject added successfully");
      }
      setNewItemName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone.",
      )
    )
      return;

    try {
      if (activeTab === "classes") {
        await removeClass(id);
        toast.success("Class deleted successfully");
      } else {
        await removeSubject(id);
        toast.success("Subject deleted successfully");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
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
                    onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
