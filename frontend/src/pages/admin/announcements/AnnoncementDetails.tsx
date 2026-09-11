import { ROUTES } from "../../../config/routes";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Clock, Megaphone, Edit2, Save, X, AlertTriangle } from "lucide-react";
import { useAnnouncementStore } from "../../../store/announcement.store";
import { useClassStore } from "../../../store/class.store";
import React, { useEffect, useState } from "react";
import { Spinner } from "../../../components/ui/Spinner";

export function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { announcements, fetchAnnouncements, deleteAnnouncement, updateAnnouncement } =
    useAnnouncementStore();
  const { classes, loadClasses } = useClassStore();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    category: "",
  });

  useEffect(() => {
    fetchAnnouncements().catch(console.error);
    loadClasses().catch(console.error);
  }, [fetchAnnouncements, loadClasses]);

  const found = announcements.find((a) => a.id === id);

  useEffect(() => {
    if (found && !isEditing) {
      setForm({
        title: found.title,
        body: found.content,
        audience: found.audience,
        priority: found.priority,
        category: found.category,
      });
    }
  }, [found, isEditing]);

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

  const handleDelete = () => {
    deleteAnnouncement(found.id);
    navigate(ROUTES.ADMIN.ANNOUNCEMENTS);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAnnouncement(found.id, {
        title: form.title,
        content: form.body,
        priority: form.priority,
        category: form.category,
        audience: form.audience,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.ANNOUNCEMENTS}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            {isEditing ? "Edit Announcement" : "Announcement"}
          </h1>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
                title="Edit announcement"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 hover:border-red-100 border border-transparent transition-all cursor-pointer"
                title="Delete announcement"
              >
                <Trash2 size={18} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-all cursor-pointer"
              title="Cancel editing"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-8 max-w-3xl w-full mx-auto">
        {isEditing ? (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.body}
                onChange={(e) => set("body", e.target.value)}
                required
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Audience
                </label>
                <select
                  value={form.audience}
                  onChange={(e) => set("audience", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select…</option>
                  <optgroup label="General">
                    <option value="ALL">All Users</option>
                    <option value="TEACHERS">All Teachers</option>
                    <option value="STUDENTS">All Students</option>
                    <option value="PARENTS">All Parents</option>
                  </optgroup>
                  <optgroup label="Specific Classes">
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value as "LOW" | "MEDIUM" | "HIGH")}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="">Select…</option>
                  <option value="GENERAL">General</option>
                  <option value="ACADEMICS">Academics</option>
                  <option value="EVENTS">Events</option>
                  <option value="ALERTS">Alerts</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" color="white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="font-extrabold text-slate-900 text-lg leading-tight">
                    {found.title}
                  </h2>
                  {found.priority === "HIGH" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                      <AlertTriangle size={12} />
                      High Priority
                    </span>
                  )}
                  {found.priority === "MEDIUM" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Medium Priority
                    </span>
                  )}
                  {found.priority === "LOW" && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Low Priority
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    Category: {found.category}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                    To: {found.audience === "ALL" ? "All Users" : found.audience}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed text-base whitespace-pre-wrap">
              {found.content}
            </p>

            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 gap-2 sm:gap-5">
              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-100 flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-slate-400">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <p className="text-[10px] sm:text-xs tracking-wider">Published</p>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-800 mt-1">
                  {found.date}
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2.5 sm:p-4 border border-slate-100 flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 text-slate-400">
                  <Megaphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <p className="text-[10px] sm:text-xs tracking-wider">Author</p>
                </div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-800 mt-1">
                  {found.authorName || found.author}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
