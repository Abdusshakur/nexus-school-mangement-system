import { useState } from "react";
import { ChildCard } from "./components/ChildCard";
import { mockProfile, mockAssignments } from "../dashboard/data";

export function ParentChildren() {
  const profile = mockProfile;
  const assignments = mockAssignments;

  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const children = profile?.children ?? [];

  return (
    <div className="space-y-5 max-w-5xl pb-10">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">My Children</h1>
        <p className="text-sm mt-0.5 text-slate-500">
          {children.length} enrolled{" "}
          {children.length === 1 ? "child" : "children"}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="bg-white rounded-xl py-16 text-center border border-slate-200">
          <p className="font-semibold mb-1 text-slate-900">
            No children linked
          </p>
          <p className="text-sm text-slate-400">
            Contact the school office to link your children.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {children.map((child, i) => (
            <ChildCard
              key={child.admNo}
              child={child}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
              assignments={assignments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
