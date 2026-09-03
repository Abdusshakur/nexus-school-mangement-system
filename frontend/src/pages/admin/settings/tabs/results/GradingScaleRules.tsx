import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import type { GradingRuleResponse } from "../../../../../api/resultsConfig";
import { toast } from "sonner";

interface GradingScaleRulesProps {
  scaleId: string;
}

export function GradingScaleRules({ scaleId }: GradingScaleRulesProps) {
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const { loadGradingRules, gradingRules, createNewGradingRule, editGradingRule } = useResultsConfigStore();
  
  const rules = gradingRules[scaleId] || [];

  const [ruleForm, setRuleForm] = useState({
    grade: "",
    minimum_percentage: 0,
    maximum_percentage: 100,
    remark: "",
  });

  useEffect(() => {
    loadGradingRules(scaleId)
      .catch(() => toast.error("Failed to load grading rules. Backend endpoint may be missing."))
      .finally(() => setLoading(false));
  }, [scaleId, loadGradingRules]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleForm.grade) return;
    
    if (ruleForm.minimum_percentage > ruleForm.maximum_percentage) {
      toast.error("Minimum percentage cannot exceed maximum percentage");
      return;
    }
    
    try {
      if (editingRuleId) {
        await editGradingRule(editingRuleId, ruleForm);
        toast.success("Grading rule updated");
      } else {
        await createNewGradingRule(scaleId, ruleForm);
        toast.success("Grading rule added");
      }
      setAdding(false);
      setEditingRuleId(null);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save grading rule");
    }
  };

  const resetForm = () => {
    setRuleForm({
      grade: "",
      minimum_percentage: 0,
      maximum_percentage: 100,
      remark: "",
    });
  };

  const startEdit = (rule: GradingRuleResponse) => {
    setRuleForm({
      grade: rule.grade,
      minimum_percentage: rule.minimum_percentage,
      maximum_percentage: rule.maximum_percentage,
      remark: rule.remark || "",
    });
    setEditingRuleId(rule.id);
    setAdding(true);
  };

  const cancelForm = () => {
    setAdding(false);
    setEditingRuleId(null);
    resetForm();
  };

  if (loading) {
    return <div className="p-4 flex justify-center"><Spinner className="w-5 h-5 text-indigo-600" /></div>;
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800">Grading Rules</h4>
      </div>

      <div className="space-y-3">
        {rules.length === 0 && !adding && (
          <p className="text-sm text-slate-500 italic">No rules defined yet.</p>
        )}
        
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg">{rule.grade}</span>
                {rule.remark && (
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {rule.remark}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {rule.minimum_percentage}% — {rule.maximum_percentage}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(rule)}
                className="px-3 py-1.5 rounded-md text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}

        {adding ? (
          <form onSubmit={handleSave} className="bg-white border border-indigo-200 p-4 rounded-lg shadow-sm space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade (e.g. A, B)</label>
                <input required type="text" value={ruleForm.grade} onChange={e => setRuleForm({...ruleForm, grade: e.target.value.toUpperCase()})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min %</label>
                <input required type="number" min="0" max="100" step="0.1" value={ruleForm.minimum_percentage} onChange={e => setRuleForm({...ruleForm, minimum_percentage: parseFloat(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max %</label>
                <input required type="number" min="0" max="100" step="0.1" value={ruleForm.maximum_percentage} onChange={e => setRuleForm({...ruleForm, maximum_percentage: parseFloat(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remark (e.g. Excellent)</label>
                <input type="text" value={ruleForm.remark} onChange={e => setRuleForm({...ruleForm, remark: e.target.value})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={cancelForm} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
              <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700">Save</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 p-2"
          >
            <Plus size={16} />
            Add Rule
          </button>
        )}
      </div>
    </div>
  );
}
