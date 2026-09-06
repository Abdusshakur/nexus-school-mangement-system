import { useState, useEffect } from "react";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { CreateTemplateModal } from "./CreateTemplateModal";
import { TemplateComponents } from "./TemplateComponents";

export function SchemeTemplatesList() {
  const { schemeTemplates, loading, loadSchemeTemplates } = useResultsConfigStore();
  const [showModal, setShowModal] = useState(false);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  useEffect(() => {
    loadSchemeTemplates();
  }, [loadSchemeTemplates]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
        <div>
          <h3 className="font-bold text-indigo-900 text-sm">Global Scheme Templates</h3>
          <p className="text-xs text-indigo-700 mt-1">
            Create a template here, add your CA and Exam components, and then apply it to the entire school instantly.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Spinner className="text-indigo-600 w-8 h-8" />
        </div>
      ) : schemeTemplates.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No global scheme templates configured yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schemeTemplates.map((template) => {
            const isExpanded = expandedTemplateId === template.id;
            return (
              <div key={template.id} className={`border ${template.is_active ? 'border-emerald-200' : 'border-slate-200'} rounded-lg bg-white shadow-sm overflow-hidden`}>
                <div 
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${template.is_active ? 'hover:bg-emerald-50' : 'hover:bg-slate-50'}`}
                  onClick={() => setExpandedTemplateId(isExpanded ? null : template.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">{template.name}</h3>
                        {template.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                            Active
                          </span>
                        )}
                        {!template.is_active && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wider">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Applied globally to all classes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-600 border border-slate-200 px-2 py-1 rounded-md bg-white">
                      Weight: {template.total_weight}%
                    </span>
                  </div>
                </div>
                {isExpanded && (
                  <TemplateComponents templateId={template.id} totalTargetWeight={template.total_weight} isActive={template.is_active} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && <CreateTemplateModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
