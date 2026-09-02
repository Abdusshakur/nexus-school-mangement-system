import { useState } from "react";
import { AssessmentSchemesList } from "./AssessmentSchemesList";
import { GradingScalesList } from "./GradingScalesList";
import { GraduationCap, Percent } from "lucide-react";

export function ResultsSettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState<"schemes" | "scales">("schemes");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full min-h-[600px]">
      <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Results & Grading Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">
            Configure assessment schemes and grading scales for official results
          </p>
        </div>
      </div>

      <div className="flex border-b border-slate-200 px-6 mt-4">
        <button
          onClick={() => setActiveSubTab("schemes")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === "schemes"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <GraduationCap size={16} />
          Assessment Schemes
        </button>
        <button
          onClick={() => setActiveSubTab("scales")}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeSubTab === "scales"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Percent size={16} />
          Grading Scales
        </button>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        {activeSubTab === "schemes" ? <AssessmentSchemesList /> : <GradingScalesList />}
      </div>
    </div>
  );
}
