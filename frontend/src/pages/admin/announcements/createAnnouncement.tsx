import { ROUTES } from "../../../config/routes";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { useAnnouncementStore } from "../../../store/announcement.store";

export function CreateAnnouncement() {
  const navigate = useNavigate();
  const { postAnnouncement } = useAnnouncementStore();
  const [form, setForm] = useState({
    title: "",
    body: "",
    audience: "",
    priority: "medium",
    category: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await postAnnouncement({
        title: form.title,
        content: form.body,
      });
      navigate(ROUTES.ADMIN.ANNOUNCEMENTS);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.ANNOUNCEMENTS}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Create Announcement
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Publish a new school announcement
          </p>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-3xl w-full mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
                placeholder="Announcement title…"
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
                placeholder="Write your announcement here…"
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
                  {[
                    "All",
                    "All Students",
                    "All Parents",
                    "All Teachers",
                    "JSS 1",
                    "JSS 2",
                    "JSS 3",
                    "SS 1",
                    "SS 2",
                    "SS 3",
                  ].map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => set("priority", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
                  {[
                    "Academic",
                    "Events",
                    "Sports",
                    "Facilities",
                    "Administrative",
                    "Holiday",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-70 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? "Publishing…" : "Publish Announcement"}
            </button>
            <Link
              to={ROUTES.ADMIN.ANNOUNCEMENTS}
              className="flex items-center gap-2 px-5 py-3 border border-slate-200 bg-white text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all"
            >
              <X size={16} /> Cancel
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
