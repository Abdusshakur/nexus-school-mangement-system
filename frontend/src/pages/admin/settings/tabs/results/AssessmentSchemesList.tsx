import { useState, useEffect } from "react";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { CreateSchemeModal } from "./CreateSchemeModal";
import { SchemeComponents } from "./SchemeComponents";

export function AssessmentSchemesList() {
  const { schemes, loading, loadSchemes } = useResultsConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  useEffect(() => {
    loadSchemes();
  }, [loadSchemes]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Scheme
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner className="text-indigo-600 w-8 h-8" />
        </div>
      ) : schemes.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No assessment schemes configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemes.map((scheme) => {
            const isExpanded = expandedSchemeId === scheme.id;
            return (
              <div key={scheme.id} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => setExpandedSchemeId(isExpanded ? null : scheme.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{scheme.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {scheme.class_id ? scheme.class_name : "All Classes"}
                        </span>
                        • 
                        <span className="font-semibold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                          {scheme.subject_id ? scheme.subject_name : "All Subjects"}
                        </span>
                        • 
                        <span>{scheme.academic_term_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${scheme.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {scheme.status}
                    </span>
                    <span className="text-xs font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md">
                      Weight: {scheme.total_weight}%
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <SchemeComponents schemeId={scheme.id} totalTargetWeight={scheme.total_weight} schemeStatus={scheme.status} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateSchemeModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
