import { Clock, Award, ArrowRight } from "lucide-react";
import type { Assignment } from "./data";

interface Props {
  assignments: Assignment[];
  activeAssignment: Assignment | null;
  onSelectAssignment: (assignment: Assignment) => void;
}

export function AssignmentList({
  assignments,
  activeAssignment,
  onSelectAssignment,
}: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-slate-900 text-lg">
        Active Coursework
      </h3>

      {assignments.map((as) => (
        <div
          key={as.id}
          onClick={() => onSelectAssignment(as)}
          className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer ${
            activeAssignment?.id === as.id
              ? "border-indigo-500 ring-2 ring-indigo-500/10"
              : "border-slate-200"
          }`}
        >
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                {as.class}
              </span>
              <h4 className="font-extrabold text-slate-900 text-base mt-2">
                {as.title}
              </h4>
              <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                {as.description}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-400 block">
                DUE DATE
              </span>
              <span className="text-slate-800 text-sm font-bold block mt-0.5">
                {as.dueDate}
              </span>
              <span className="text-xs text-slate-400 font-medium block mt-1">
                {as.maxPoints} pts max
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <div className="flex gap-4">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                <strong>{as.submittedCount || 4}</strong> Submissions
              </span>
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <Award size={13} className="text-slate-400" />
                <strong>{as.gradedCount}</strong> Graded
              </span>
            </div>
            <span className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
              Review Submissions
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
