import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { fetchActiveSummary } from "../../../../../api/academics";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { toast } from "sonner";

interface CreateGradingScaleModalProps {
  onClose: () => void;
}

export function CreateGradingScaleModal({ onClose }: CreateGradingScaleModalProps) {
  const { createNewGradingScale } = useResultsConfigStore();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeSessionId, setActiveSessionId] = useState("");
  const [activeTermId, setActiveTermId] = useState("");

  const [formData, setFormData] = useState({
    name: "Standard Grading Scale",
    is_active: true,
  });

  useEffect(() => {
    fetchActiveSummary()
      .then((summary) => {
        if (summary.active_session) setActiveSessionId(summary.active_session.id);
        if (summary.active_term) setActiveTermId(summary.active_term.id);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load academic data");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionId || !activeTermId) {
      toast.error("No active academic session/term found");
      return;
    }
    if (!formData.name) {
      toast.error("Scale name is required");
      return;
    }

    setSubmitting(true);
    
    try {
      await createNewGradingScale({
        academic_session_id: activeSessionId,
        academic_term_id: activeTermId,
        name: formData.name,
        is_active: formData.is_active,
        version: 1,
      });
      toast.success("Grading scale created!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create scale");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create Grading Scale</h2>
            <p className="text-sm text-slate-500">Add a new scale for grade mappings</p>
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
            <form id="scale-form" onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Scale Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="e.g. Standard High School Scale"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer mt-4">
                <input 
                  type="checkbox" 
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 font-bold">Set as Active</span>
              </label>

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
            form="scale-form"
            disabled={submitting || loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? <Spinner className="w-4 h-4" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
