import { ROUTES } from "../../../config/routes";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Users, Megaphone } from "lucide-react";
import { priorityConfig } from "./data";
import { useAnnouncementStore } from "../../../store/announcement.store";
import { useEffect } from "react";

export function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { announcements, fetchAnnouncements, deleteAnnouncement } =
    useAnnouncementStore();

  useEffect(() => {
    fetchAnnouncements().catch(console.error);
  }, [fetchAnnouncements]);

  const found = announcements.find((a) => a.id === id);

  if (!found) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="mb-4 font-semibold text-base">Announcement not found.</p>
        <Link
          to={ROUTES.ADMIN.ANNOUNCEMENTS}
          className="text-indigo-600 font-bold hover:underline"
        >
          Back to list
        </Link>
      </div>
    );
  }

  const ann = {
    id: found.id,
    title: found.title,
    body: found.content,
    date: found.date,
    priority: found.priority,
    audience: found.audience,
    author: found.authorName || found.author,
    category: found.category,
  };

  const handleDelete = () => {
    deleteAnnouncement(ann.id);
    navigate(ROUTES.ADMIN.ANNOUNCEMENTS);
  };

  const p =
    priorityConfig[ann.priority as keyof typeof priorityConfig] ||
    priorityConfig.MEDIUM;

  return (
    <div className="flex-1 flex flex-col min-w-0 ">
      <header className=" border-b border-slate-200 px-8 py-5 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.ANNOUNCEMENTS}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Announcement
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="ml-auto p-2.5 rounded-xl hover:bg-red-50 text-red-500 hover:border-red-100 border border-transparent transition-all cursor-pointer"
          title="Delete announcement"
        >
          <Trash2 size={18} />
        </button>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-3xl w-full mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${p.className}`}
            >
              <p.icon size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-slate-900 text-lg leading-tight">
                {ann.title}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.className}`}
                >
                  {p.label} <span className="hidden sm:inline">Priority</span>
                </span>
                <span className="text-slate-300 text-xs">·</span>
                <span className="text-xs font-semibold text-slate-500">
                  {ann.category}
                </span>
              </div>
            </div>
          </div>

          <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
            {ann.body}
          </p>

          <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-2 sm:gap-5">
            {[
              { icon: Clock, label: "Published", value: ann.date },
              { icon: Users, label: "Audience", value: ann.audience },
              { icon: Megaphone, label: "Author", value: ann.author },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-100 flex flex-col items-center text-center sm:items-start sm:text-left"
              >
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-slate-400">
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <p className="text-[10px] sm:text-xs tracking-wider">{label}</p>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-800 mt-1">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
