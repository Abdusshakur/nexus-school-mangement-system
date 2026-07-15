import React, { useState } from "react";
import type { Assignment } from "./data";

interface Props {
  onPost: (
    assignment: Omit<Assignment, "id" | "submittedCount" | "gradedCount">,
  ) => void;
  onCancel: () => void;
}

export function CreateAssignment({ onPost, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [selectedClass, setSelectedClass] = useState(
    "Physics & Thermodynamics",
  );
  const [dueDate, setDueDate] = useState("");
  const [maxPoints, setMaxPoints] = useState(100);
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dueDate || !description) return;

    onPost({
      title,
      class: selectedClass,
      dueDate,
      maxPoints: Number(maxPoints),
      description,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
    >
      <h3 className="font-extrabold text-slate-900 text-lg">
        Create New Coursework
      </h3>

      <div>
        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Assignment Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Matrix Transformations Lab"
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Target Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-12 bg-slate-50"
          >
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

        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Max Points
          </label>
          <input
            type="number"
            value={maxPoints}
            onChange={(e) => setMaxPoints(Number(e.target.value))}
            min={1}
            max={100}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Due Date
        </label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
          Coursework Guidelines
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed guidelines or guidelines for files to submit..."
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
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          Publish Assignment
        </button>
      </div>
    </form>
  );
}
