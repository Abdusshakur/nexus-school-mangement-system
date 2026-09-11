import { ROUTES } from "../../../config/routes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, Users, Megaphone, ArrowRight, AlertTriangle, UserCircle } from "lucide-react";
import { useAnnouncementStore } from "../../../store/announcement.store";
import { Skeleton } from "../../../components/ui/Skeleton";

export function AnnouncementList() {
  const [filter, setFilter] = useState("All");

  const { announcements, fetchAnnouncements, loading } = useAnnouncementStore();

  useEffect(() => {
    const priority = filter === "All" ? undefined : (filter.toUpperCase() as "LOW" | "MEDIUM" | "HIGH");
    fetchAnnouncements(undefined, priority).catch(console.error);
  }, [filter, fetchAnnouncements]);

  const listToRender = announcements.map((a) => ({
    id: a.id,
    title: a.title,
    body: a.content,
    date: a.date,
    priority: a.priority,
    audience: a.audience,
    category: a.category,
    author: a.author,
  }));

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Announcements
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {announcements.length} active announcements
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN.ANNOUNCEMENT_CREATE}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-4.5 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 animate-fade-in"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
          <span className="hidden sm:inline">Create Announcement</span>
          <span className="sm:hidden">Create</span>
        </Link>
      </header>

      <main className="flex-1 py-8 space-y-6 max-w-full w-full ">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {["All", "High", "Medium", "Low"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-4">
                <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : listToRender.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500 text-sm">
              No announcements published yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {listToRender.map((ann) => {
              return (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <h3 className="font-semibold text-slate-900 flex-1 text-base">
                          {ann.title}
                        </h3>
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
                      
                      <p className="text-sm text-slate-600 mt-2.5 leading-relaxed whitespace-pre-wrap">
                        {ann.body}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 pt-4 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-xs font-bold">
                          <UserCircle size={14} /> {ann.author}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                          <Clock size={12} /> {ann.date}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                          <Megaphone size={12} /> Category: {ann.category}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">
                          <Users size={12} /> To: {ann.audience === "ALL" ? "All Users" : ann.audience}
                        </span>

                        <Link
                          to={ROUTES.ADMIN.ANNOUNCEMENT_DETAIL(ann.id)}
                          className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors flex items-center gap-1"
                        >
                          View details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
