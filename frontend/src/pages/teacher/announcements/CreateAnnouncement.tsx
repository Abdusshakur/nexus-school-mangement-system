import React, { useState } from "react";
import { Send } from "lucide-react";
import type { Announcement } from "./data";

interface Props {
  onPost: (ann: Omit<Announcement, "id">) => void;
  onCancel: () => void;
}

export function CreateAnnouncement({ onPost, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState("All Classes");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    onPost({
      title,
      content,
      target,
      author: "Dr. Eleanor Kim",
      date: "Just now",
    });

    setTitle("");
    setContent("");
    setTarget("All Classes");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
    >
      <h3 className="font-extrabold text-slate-900 text-lg">
        Create New Announcement
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
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
            Target Class
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-12 bg-slate-50"
          >
            <option value="All Classes">All Classes</option>
            <option value="Advanced Mathematics III">
              Advanced Mathematics III
            </option>
            <option value="Physics & Thermodynamics">
              Physics & Thermodynamics
            </option>
            <option value="Computer Programming II">
              Computer Programming II
            </option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Bulletin Content
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
