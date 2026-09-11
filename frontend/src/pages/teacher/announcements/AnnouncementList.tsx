
import { Trash2, UserCircle, AlertTriangle, Clock, Users, Megaphone } from "lucide-react";
import type { StoreAnnouncement } from "../../../store/announcement.store";
import { Skeleton } from "../../../components/ui/Skeleton";

interface AnnouncementListProps {
  announcements: StoreAnnouncement[];
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
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-slate-900 text-lg">{ann.title}</h3>
                {ann.priority === "HIGH" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                    <AlertTriangle size={12} />
                    High
                  </span>
                )}
                {ann.priority === "MEDIUM" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Medium
                  </span>
                )}
                {ann.priority === "LOW" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    Low
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed mb-4">{ann.content}</p>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-4 border-t border-slate-100">
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                <Clock size={12} /> {ann.date}
              </span>
              <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-bold">
                <UserCircle size={14} /> {ann.authorRole || ann.authorName}
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                <Megaphone size={12} /> Category: {ann.category}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                <Users size={12} /> To: {ann.audience === "ALL" ? "All Classes" : ann.audience}
              </span>
            </div>
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
