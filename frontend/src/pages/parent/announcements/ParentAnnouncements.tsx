import { useEffect, useState } from "react";
import {
  fetchAnnouncements,
  type AnnouncementResponse,
} from "../../../api/announcements";
import { Skeleton } from "../../../components/ui/Skeleton";
import { X, Megaphone, Bell } from "lucide-react";

function isNew(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  return diff >= 0 && diff < 3 * 86400000;
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "HIGH":
      return "bg-red-500";
    case "MEDIUM":
      return "bg-amber-500";
    case "LOW":
    default:
      return "bg-slate-400";
  }
}

export function ParentAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AnnouncementResponse | null>(null);

  useEffect(() => {
    fetchAnnouncements("PUBLISHED")
      .then((data) => setAnnouncements(data))
      .catch((err) => console.error("Failed to load announcements", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5 pb-12 max-w-4xl ">
      <div>
        <h1 className="font-bold text-2xl text-slate-900">
          School Announcements
        </h1>
        <p className="text-sm mt-0.5 text-slate-500">
          {loading
            ? "Loading announcements..."
            : `${announcements.length} announcements from the school`}
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Bell size={32} className="text-slate-300" />
            </div>
            <p className="text-lg font-medium text-slate-700">
              No Announcements
            </p>
            <p className="text-sm mt-1">
              There are no published announcements at this time.
            </p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white rounded-xl p-5 cursor-pointer transition-shadow hover:shadow-md border border-slate-200"
              onClick={() => setSelected(ann)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 mt-1.5 ${getPriorityColor(ann.priority)}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-[15px] text-slate-900">
                      {ann.title}
                    </p>
                    {isNew(ann.created_at) && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        New
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                      {ann.audience}
                    </span>
                  </div>
                  <p className="text-xs mb-2 text-slate-400">
                    {fmtDate(ann.created_at)}
                  </p>
                  <p className="text-sm leading-relaxed line-clamp-2 text-slate-700">
                    {ann.content}
                  </p>
                </div>
                <Megaphone size={16} className="shrink-0 mt-1 text-slate-300" />
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full shrink-0 ${getPriorityColor(selected.priority)}`}
                />
                <h2 className="font-bold text-base text-slate-900">
                  {selected.title}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-slate-400">
                  {fmtDate(selected.created_at)}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                  {selected.audience}
                </span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
                {selected.content}
              </p>
              <p className="text-xs mt-5 text-slate-400">
                {selected.author_name || "School Administration"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
