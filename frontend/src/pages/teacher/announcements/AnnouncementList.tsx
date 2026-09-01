
import { Trash2, UserCircle } from "lucide-react";
import type { Announcement } from "./data";
import { Skeleton } from "../../../components/ui/Skeleton";

interface AnnouncementListProps {
  announcements: Announcement[];
  loading?: boolean;
  onDelete: (id: string) => void;
}

export function AnnouncementList({ announcements, loading, onDelete }: AnnouncementListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-24 mb-2.5 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
            <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <p className="text-slate-500">No announcements posted yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((ann) => (
        <div key={ann.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 text-lg">{ann.title}</h3>
              <span className="text-xs font-semibold text-slate-500">{ann.date}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2.5 text-indigo-600 bg-indigo-50 w-fit px-2.5 py-1 rounded-md">
              <UserCircle size={14} />
              <span className="text-xs font-bold">{ann.authorRole || ann.author}</span>
            </div>
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
          </div>
          <button
            onClick={() => onDelete(ann.id)}
            className="self-start p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Announcement"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
