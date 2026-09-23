import { Skeleton } from "../../../components/ui/Skeleton";
import { useParentContextStore } from "../../../store/parentContext.store";
import { useEffect } from "react";

export const ParentPlaceholder = ({ title }: { title: string }) => {
  const { loadingProfile, loadProfile, profile } = useParentContextStore();

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  if (loadingProfile) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm mt-0.5 text-slate-500">
          This feature is currently under development.
        </p>
      </div>
      <div className="bg-white rounded-xl py-16 text-center border border-slate-200 shadow-sm">
        <p className="font-semibold text-slate-700 mb-2">{title} Coming Soon</p>
      </div>
    </div>
  );
};
