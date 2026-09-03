import { useState, useEffect } from "react";
import { Plus, Percent } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import { toast } from "sonner";
import type { GradingRuleResponse } from "../../../../../api/resultsConfig";

interface ScaleRulesProps {
  scaleId: string;
}

export function ScaleRules({ scaleId }: ScaleRulesProps) {
  const [rules, setRules] = useState<GradingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  const { loadGradingRules, createNewGradingRule } = useResultsConfigStore();
  
  const [newRule, setNewRule] = useState({
    grade: "",
    minimum_percentage: 0,
    maximum_percentage: 100,
    remark: "",
  });

  useEffect(() => {
    loadGradingRules(scaleId)
      .then(data => setRules(data))
      .catch(() => toast.error("Failed to load rules"))
      .finally(() => setLoading(false));
  }, [scaleId, loadGradingRules]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.grade) return;
    if (newRule.minimum_percentage >= newRule.maximum_percentage) {
      toast.error("Minimum percentage must be less than maximum percentage");
      return;
    }
    
    // Check overlap
    const hasOverlap = rules.some(r => 
      (newRule.minimum_percentage >= r.minimum_percentage && newRule.minimum_percentage < r.maximum_percentage) ||
      (newRule.maximum_percentage > r.minimum_percentage && newRule.maximum_percentage <= r.maximum_percentage) ||
      (newRule.minimum_percentage <= r.minimum_percentage && newRule.maximum_percentage >= r.maximum_percentage)
    );

    if (hasOverlap) {
      toast.error("This rule overlaps with an existing grading rule!");
      return;
    }
    
    try {
      const created = await createNewGradingRule(scaleId, newRule);
      setRules([...rules, created].sort((a, b) => b.minimum_percentage - a.minimum_percentage));
      setAdding(false);
      setNewRule({
        grade: "",
        minimum_percentage: 0,
        maximum_percentage: 100,
        remark: "",
      });
      toast.success("Rule added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add rule");
    }
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
          <p className="text-sm text-slate-500 italic">No rules added yet.</p>
        )}
        
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-lg">{rule.grade}</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {rule.remark}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                {rule.minimum_percentage} <Percent size={12} /> - {rule.maximum_percentage} <Percent size={12} />
              </span>
            </div>
          </div>
        ))}

        {adding ? (
          <form onSubmit={handleAdd} className="bg-white border border-indigo-200 p-4 rounded-lg shadow-sm space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
                <input required type="text" placeholder="A, B, C..." value={newRule.grade} onChange={e => setNewRule({...newRule, grade: e.target.value})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Min %</label>
                <input required type="number" min="0" max="100" value={newRule.minimum_percentage} onChange={e => setNewRule({...newRule, minimum_percentage: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Max %</label>
                <input required type="number" min="0" max="100" value={newRule.maximum_percentage} onChange={e => setNewRule({...newRule, maximum_percentage: parseInt(e.target.value) || 0})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remark</label>
                <input required type="text" placeholder="Excellent" value={newRule.remark} onChange={e => setNewRule({...newRule, remark: e.target.value})} className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setAdding(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Cancel</button>
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
