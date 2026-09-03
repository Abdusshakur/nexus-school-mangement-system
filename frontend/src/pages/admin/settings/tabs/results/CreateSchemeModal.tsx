import { useState, useEffect } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { fetchActiveSummary } from "../../../../../api/academics";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { useClassStore } from "../../../../../store/class.store";
import { useSubjectStore } from "../../../../../store/subject.store";
import { toast } from "sonner";

interface CreateSchemeModalProps {
  onClose: () => void;
}

export function CreateSchemeModal({ onClose }: CreateSchemeModalProps) {
  const { createNewScheme } = useResultsConfigStore();
  const { classes, loadClasses } = useClassStore();
  const { subjects, loadSubjects } = useSubjectStore();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState("");
  const [activeTermId, setActiveTermId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    total_weight: 100,
  });

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  useEffect(() => {
    loadClasses();
    loadSubjects();
    fetchActiveSummary()
      .then((summary) => {
        if (summary.active_session)
          setActiveSessionId(summary.active_session.id);
        if (summary.active_term) setActiveTermId(summary.active_term.id);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load academic data");
        setLoading(false);
      });
  }, [loadClasses, loadSubjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || !activeTermId) {
      toast.error("No active academic session/term found");
      return;
    }
    if (!formData.name) {
      toast.error("Scheme name is required");
      return;
    }

    setSubmitting(true);

    try {
      await createNewScheme({
        academic_session_id: activeSessionId,
        academic_term_id: activeTermId,
        class_id: selectedClassId || null,
        subject_id: selectedSubjectId || null,
        name: formData.name,
        total_weight: formData.total_weight,
        status: "DRAFT",
      });
      toast.success("Assessment Scheme created!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create scheme");
    } finally {
      setSubmitting(false);
    }
  };

  const isGlobal = !selectedClassId && !selectedSubjectId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Create Result Scheme
            </h2>
            <p className="text-sm text-slate-500">
              Configure a grading scheme for the school or specific classes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center p-12">
            <Spinner className="text-indigo-600 w-8 h-8" />
          </div>
        ) : (
          <div className="p-6">
            <form
              id="scheme-form"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Scheme Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Standard JSS Scheme"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Class (Optional)
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                    >
                      <option value="">All Classes (Global)</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Subject (Optional)
                    </label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
                    >
                      <option value="">All Subjects (Global)</option>
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">
                    Total Target Weight (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.total_weight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_weight: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              {isGlobal ? (
                <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl border border-indigo-100 flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Check size={16} className="text-indigo-600" />
                  </div>
                  <p>
                    This scheme will serve as the <strong>global default</strong>{" "}
                    for all classes and subjects in the current academic term.
                  </p>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-100 flex gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <AlertCircle size={16} className="text-amber-600" />
                  </div>
                  <p>
                    This scheme will act as a <strong>specific override</strong>. It will only apply when the selected class and subject match.
                  </p>
                </div>
              )}
            </form>
          </div>
        )}

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="scheme-form"
            disabled={submitting || loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <Spinner className="w-4 h-4" />
            ) : (
              "Save Scheme"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
