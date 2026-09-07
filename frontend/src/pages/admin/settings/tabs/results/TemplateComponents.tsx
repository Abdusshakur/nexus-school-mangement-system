import { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckCircle, UploadCloud } from "lucide-react";
import { Spinner } from "../../../../../components/ui/Spinner";
import { useResultsConfigStore } from "../../../../../store/resultsConfig.store";
import type { AssessmentTemplateComponentResponse } from "../../../../../api/resultsConfig";
import { fetchActiveSummary } from "../../../../../api/academics";
import { toast } from "sonner";

interface TemplateComponentsProps {
  templateId: string;
  totalTargetWeight: number;
  isActive: boolean;
}

export function TemplateComponents({
  templateId,
  totalTargetWeight,
  isActive,
}: TemplateComponentsProps) {
  const [components, setComponents] = useState<
    AssessmentTemplateComponentResponse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [activating, setActivating] = useState(false);
  const [applying, setApplying] = useState(false);

  const {
    loadTemplateComponents,
    addTemplateComponent,
    activateTemplate,
    applyTemplate,
  } = useResultsConfigStore();

  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "CONTINUOUS_ASSESSMENT",
    max_score: 100,
    weight: 0,
    sequence: 1,
    is_required: true,
  });

  useEffect(() => {
    loadTemplateComponents(templateId)
      .then((data) => setComponents(data))
      .catch(() => toast.error("Failed to load template components"))
      .finally(() => setLoading(false));
  }, [templateId, loadTemplateComponents]);

  const currentTotalWeight = components.reduce((sum, c) => sum + c.weight, 0);
  const isWeightMatching = currentTotalWeight === totalTargetWeight;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponent.name || newComponent.weight <= 0) return;

    if (currentTotalWeight + newComponent.weight > totalTargetWeight) {
      toast.error(
        `Cannot exceed template's total target weight of ${totalTargetWeight}%`,
      );
      return;
    }

    try {
      const created = await addTemplateComponent(
        templateId,
        newComponent as any,
      );
      setComponents(
        [...components, created].sort((a, b) => a.sequence - b.sequence),
      );
      setAdding(false);
      setNewComponent({
        name: "",
        type: "CONTINUOUS_ASSESSMENT",
        max_score: 100,
        weight: 0,
        sequence: components.length + 2,
        is_required: true,
      });
      toast.success("Component added to template");
    } catch (err: any) {
      toast.error(err.message || "Failed to add component");
    }
  };

  const handleActivate = async () => {
    setActivating(true);
    try {
      await activateTemplate(templateId);
      toast.success("Template activated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to activate template");
    } finally {
      setActivating(false);
    }
  };

  const handleApplyToSchool = async () => {
    // apply to the active session and term.
    setApplying(true);
    try {
      // Fetch active summary to get session and term IDs
      const activeData = await fetchActiveSummary();

      if (!activeData || !activeData.session_id || !activeData.term_id) {
        throw new Error(
          "Missing active session or term IDs. Ensure a term is active.",
        );
      }

      const result = await applyTemplate(
        templateId,
        activeData.session_id,
        activeData.term_id,
      );
      if (result.created > 0) {
        toast.success(`Template applied successfully to ${result.created} new classes!`);
      } else {
        toast.info(`No new classes needed this template. Skipped ${result.skipped} classes that already have a scheme with this name.`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to apply template to the school");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Spinner className="w-5 h-5 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-t border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-800">
          Template Components
        </h4>
        <div
          className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-md ${isWeightMatching ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          {!isWeightMatching && <AlertCircle size={14} />}
          Total Weight: {currentTotalWeight} / {totalTargetWeight}%
        </div>
      </div>

      <div className="space-y-3">
        {components.length === 0 && !adding && (
          <p className="text-sm text-slate-500 italic">
            No components added yet.
          </p>
        )}

        {components.map((comp) => (
          <div
            key={comp.id}
            className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-lg shadow-sm"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">
                  {comp.name}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {comp.type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max Score: {comp.max_score}
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
          <form
            onSubmit={handleAdd}
            className="bg-white border border-indigo-200 p-4 rounded-lg shadow-sm space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Name (e.g. CA 1, Midterm)
                </label>
                <input
                  required
                  type="text"
                  value={newComponent.name}
                  onChange={(e) =>
                    setNewComponent({
                      ...newComponent,
                      name: e.target.value
                        .split(" ")
                        .map((w) =>
                          w.length <= 2
                            ? w.toUpperCase()
                            : w.charAt(0).toUpperCase() + w.slice(1),
                        )
                        .join(" "),
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type
                </label>
                <select
                  value={newComponent.type}
                  onChange={(e) =>
                    setNewComponent({ ...newComponent, type: e.target.value })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CONTINUOUS_ASSESSMENT">
                    Continuous Assessment
                  </option>
                  <option value="EXAM">Exam</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="MIDTERM">Midterm</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Score
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={newComponent.max_score}
                  onChange={(e) =>
                    setNewComponent({
                      ...newComponent,
                      max_score: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Weight (%)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={newComponent.weight}
                  onChange={(e) =>
                    setNewComponent({
                      ...newComponent,
                      weight: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          !isActive && (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 p-2"
            >
              <Plus size={16} />
              Add Component
            </button>
          )
        )}

        {isWeightMatching && !isActive && !adding && (
          <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleActivate}
              disabled={activating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {activating ? (
                <Spinner className="w-4 h-4 text-white" />
              ) : (
                <CheckCircle size={16} />
              )}
              Activate Template
            </button>
          </div>
        )}

        {isActive && (
          <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col items-end gap-3">
            <div className="bg-indigo-50 text-indigo-700 text-xs font-medium p-3 rounded-lg border border-indigo-100 max-w-lg text-right">
              This template is locked and ready. Click the button below to
              instantly create draft assessment schemes for every class and
              subject in the school using this template.
            </div>
            <button
              onClick={handleApplyToSchool}
              disabled={applying}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {applying ? (
                <Spinner className="w-5 h-5 text-white" />
              ) : (
                <UploadCloud size={18} />
              )}
              Apply Template to Entire School
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
