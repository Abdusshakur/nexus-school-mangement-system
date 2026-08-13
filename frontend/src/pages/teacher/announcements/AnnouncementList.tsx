
import { Trash2, UserCircle } from "lucide-react";
import type { Announcement } from "./data";

interface AnnouncementListProps {
  announcements: Announcement[];
  onDelete: (id: string) => void;
}

export function AnnouncementList({ announcements, onDelete }: AnnouncementListProps) {
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
