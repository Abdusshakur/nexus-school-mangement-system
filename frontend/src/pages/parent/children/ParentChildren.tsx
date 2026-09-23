import { useState, useEffect } from "react";
import { ChildCard } from "./components/ChildCard";
import { useParentContextStore } from "../../../store/parentContext.store";
import { Skeleton } from "../../../components/ui/Skeleton";

export function ParentChildren() {
  const { children, loadingChildren, loadChildren } = useParentContextStore();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  useEffect(() => {
    if (children.length === 0) {
      loadChildren();
    }
  }, [children.length, loadChildren]);

  if (loadingChildren) {
    return (
      <div className="space-y-5 max-w-5xl pb-10">
        <div>
           <Skeleton className="h-8 w-48 mb-2" />
           <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

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
              key={child.id}
              child={child}
              expanded={expandedIdx === i}
              onToggle={() => setExpandedIdx(expandedIdx === i ? null : i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
