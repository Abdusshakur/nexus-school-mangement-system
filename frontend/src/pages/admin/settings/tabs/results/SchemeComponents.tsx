import { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckCircle } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import type { AssessmentComponentResponse } from "../../../../../api/resultsConfig";
import { toast } from "sonner";

interface SchemeComponentsProps {
  schemeId: string;
  totalTargetWeight: number;
  schemeStatus: string;
}

export function SchemeComponents({ schemeId, totalTargetWeight, schemeStatus }: SchemeComponentsProps) {
  const [components, setComponents] = useState<AssessmentComponentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { loadSchemeComponents, addSchemeComponent, editScheme } = useResultsConfigStore();
  
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "CONTINUOUS_ASSESSMENT",
    max_score: 100,
    weight: 0,
    sequence: 1,
    is_required: true,
  });

  useEffect(() => {
    loadSchemeComponents(schemeId)
      .then(data => setComponents(data))
      .catch(() => toast.error("Failed to load components"))
      .finally(() => setLoading(false));
  }, [schemeId, loadSchemeComponents]);

  const currentTotalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const isWeightMatching = currentTotalWeight === totalTargetWeight;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponent.name || newComponent.weight <= 0) return;
    
    if (currentTotalWeight + newComponent.weight > totalTargetWeight) {
      toast.error(`Cannot exceed scheme's total target weight of ${totalTargetWeight}%`);
      return;
    }
    
    try {
      const created = await addSchemeComponent(schemeId, {
        ...newComponent,
        status: "ACTIVE"
      });
      // Update local state since store doesn't automatically trigger re-render of this component's local state
      setComponents([...components, created].sort((a, b) => a.sequence - b.sequence));
      setAdding(false);
      setNewComponent({
        name: "",
        type: "CONTINUOUS_ASSESSMENT",
        max_score: 100,
        weight: 0,
        sequence: components.length + 2,
        is_required: true,
      });
      toast.success("Component added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add component");
    }
  };

  const handleSaveScheme = async () => {
    try {
      await editScheme(schemeId, { status: "ACTIVE" });
      toast.success("Scheme saved and activated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save scheme");
    }
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Spinner className="w-5 h-5 text-indigo-600" /></div>;
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800">Assessment Components</h4>
        <div className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${isWeightMatching ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {!isWeightMatching && <AlertCircle size={14} />}
          Total Weight: {currentTotalWeight} / {totalTargetWeight}%
        </div>
      </div>

      <div className="space-y-3">
        {components.length === 0 && !adding && (
          <p className="text-sm text-slate-500 italic">No components added yet.</p>
        )}
        
        {components.map((comp) => (
          <div key={comp.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">{comp.name}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {comp.type.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max Score: {comp.max_score} • Sequence: {comp.sequence}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                {comp.weight}%
              </span>
            </div>
          </div>
        ))}

        {adding ? (
          <form onSubmit={handleAdd} className="bg-white border border-indigo-200 p-4 rounded-lg shadow-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Name (e.g. CA 1, Midterm)</label>
                <input required type="text" value={newComponent.name} onChange={e => setNewComponent({...newComponent, name: e.target.value.split(' ').map(w => w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                <select value={newComponent.type} onChange={e => setNewComponent({...newComponent, type: e.target.value})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500">
                  <option value="CONTINUOUS_ASSESSMENT">Continuous Assessment</option>
                  <option value="EXAM">Exam</option>
                  <option value="PROJECT">Project</option>
                  <option value="PRACTICAL">Practical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max Score</label>
                <input required type="number" min="1" value={newComponent.max_score} onChange={e => setNewComponent({...newComponent, max_score: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Weight (%)</label>
                <input required type="number" min="1" max="100" value={newComponent.weight} onChange={e => setNewComponent({...newComponent, weight: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700">Save</button>
            </div>
          </form>
        ) : schemeStatus === "DRAFT" && (
          <button 
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 p-2"
          >
            <Plus size={16} />
            Add Component
          </button>
        )}
        
        {isWeightMatching && schemeStatus === "DRAFT" && !adding && (
          <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
            <button 
              onClick={handleSaveScheme}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <CheckCircle size={16} />
              Save Scheme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
