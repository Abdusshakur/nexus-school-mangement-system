import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import { useClassStore } from "../../../store/class.store";

interface Props {
  onPost: (ann: { title: string; content: string; audience: string; category: string; priority: "LOW" | "MEDIUM" | "HIGH" }) => void;
  onCancel: () => void;
}

export function CreateAnnouncement({ onPost, onCancel }: Props) {
  const { classes, loadClasses } = useClassStore();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");

  useEffect(() => {
    loadClasses().catch(console.error);
  }, [loadClasses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    onPost({
      title,
      content,
      audience,
      category,
      priority,
    });

    setTitle("");
    setContent("");
    setAudience("ALL");
    setCategory("GENERAL");
    setPriority("MEDIUM");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
    >
      <h3 className="font-extrabold text-slate-900 text-lg">
        Create New Announcement
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Announcement Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Homework Extension"
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Audience (Target Class)
          </label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-12 bg-slate-50"
          >
            <option value="ALL">All Classes</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.name}>{cls.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-12 bg-slate-50"
          >
            <option value="GENERAL">General</option>
            <option value="ACADEMICS">Academics</option>
            <option value="EVENTS">Events</option>
            <option value="ALERTS">Alerts</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-12 bg-slate-50"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Announcement Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement details here..."
          required
          rows={4}
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Send size={15} /> Post Announcement
        </button>
      </div>
    </form>
  );
}
