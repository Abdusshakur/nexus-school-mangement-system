import React, { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { bulkTransferStudents } from "../../../api/students";
import { fetchActiveSummary } from "../../../api/academics";
import { toast } from "sonner";

interface BulkTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudentIds: string[];
  onSuccess: () => void;
}

export function BulkTransferModal({
  isOpen,
  onClose,
  selectedStudentIds,
  onSuccess,
}: BulkTransferModalProps) {
  const { classes, loadClasses } = useClassStore();
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeContext, setActiveContext] = useState<{session_id: string, term_id: string} | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadClasses();
      fetchActiveSummary()
        .then((data) => setActiveContext({ session_id: data.session_id, term_id: data.term_id }))
        .catch(() => toast.error("Failed to load active term context"));
    }
  }, [isOpen, loadClasses]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) {
      toast.error("Please select a destination class.");
      return;
    }
    if (!activeContext) {
      toast.error("No active session/term found to process transfer.");
      return;
    }

    setLoading(true);
    try {
      await bulkTransferStudents({
        student_ids: selectedStudentIds,
        class_id: selectedClassId,
        session_id: activeContext.session_id,
        term_id: activeContext.term_id,
      });
      toast.success(`Successfully promoted ${selectedStudentIds.length} students!`);
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to promote students.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Promote Students</h2>
            <p className="text-xs text-slate-500 mt-1">
              Promoting {selectedStudentIds.length} student(s) to a new class
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {!activeContext && (
             <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800 text-sm">
               <AlertCircle size={16} className="shrink-0 mt-0.5" />
               <p>Warning: Cannot fetch active academic session. Promotion may fail.</p>
             </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Destination Class
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
            >
              <option value="">-- Choose a class --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || selectedStudentIds.length === 0}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Promoting..." : "Confirm Promotion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
