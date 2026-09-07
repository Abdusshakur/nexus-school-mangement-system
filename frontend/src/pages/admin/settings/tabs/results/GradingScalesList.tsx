import { useState, useEffect } from "react";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { ScaleRules } from "./ScaleRules";
import { CreateGradingScaleModal } from "./CreateGradingScaleModal";
import { toast } from "sonner";

export function GradingScalesList() {
  const { gradingScales, loading, loadGradingScales, editGradingScale } = useResultsConfigStore();
  const [expandedScaleId, setExpandedScaleId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleStatus = async (scale: any) => {
    try {
      setTogglingId(scale.id);
      await editGradingScale(scale.id, { is_active: !scale.is_active });
      toast.success(`Grading scale ${!scale.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Could not update the status right now. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    loadGradingScales();
  }, [loadGradingScales]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Grading Scale
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner className="text-indigo-600 w-8 h-8" />
        </div>
      ) : gradingScales.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No grading scales configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {gradingScales.map((scale) => {
            const isExpanded = expandedScaleId === scale.id;
            return (
              <div key={scale.id} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedScaleId(isExpanded ? null : scale.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{scale.name}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Version {scale.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${scale.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {scale.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(scale);
                      }}
                      disabled={togglingId === scale.id}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors ${scale.is_active
                        ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        } ${togglingId === scale.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {togglingId === scale.id ? 'Loading...' : scale.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
                {isExpanded && <ScaleRules scaleId={scale.id} />}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateGradingScaleModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
