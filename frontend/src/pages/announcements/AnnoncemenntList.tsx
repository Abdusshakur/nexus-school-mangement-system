import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Clock, Users, Megaphone } from "lucide-react";
import { announcements, priorityConfig } from "./data";

export function AnnouncementList() {
  const [filter, setFilter] = useState("All");

  const filtered =
    filter === "All"
      ? announcements
      : announcements.filter((a) => a.priority === filter.toLowerCase());

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
          to="/announcements/create"
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 animate-fade-in"
        >
          <Plus size={16} /> Create Announcement
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
        <div className="space-y-4">
          {filtered.map((ann) => {
            const p =
              priorityConfig[ann.priority as keyof typeof priorityConfig] ||
              priorityConfig.medium;
            return (
              <div
                key={ann.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: p.bg }}
                  >
                    <p.icon size={18} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <h3 className="font-extrabold text-slate-900 flex-1 text-base">
                        {ann.title}
                      </h3>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
                        style={{ background: p.bg, color: p.color }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
                      {ann.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-slate-100">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Clock size={12} /> {ann.date}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Users size={12} /> {ann.audience}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                        <Megaphone size={12} /> {ann.category}
                      </span>
                      <Link
                        to={`/announcements/${ann.id}`}
                        className="ml-auto text-sm text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                      >
                        View details →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
