import React, { useState } from "react";
import { Plus, Trash2, Clock, X } from "lucide-react";

export type PeriodItem = {
  id: number;
  label: string;
  start: string;
  end: string;
};

interface ManagePeriodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: PeriodItem[];
  setPeriods: React.Dispatch<React.SetStateAction<PeriodItem[]>>;
  breakIds: Set<number>;
  setBreakIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export function ManagePeriodsModal({
  isOpen,
  onClose,
  periods,
  setPeriods,
  breakIds,
  setBreakIds,
}: ManagePeriodsModalProps) {
  const [newLabel, setNewLabel] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [isBreak, setIsBreak] = useState(false);

  const handleAdd = () => {
    if (!newLabel || !newStart || !newEnd) return;

    const newId =
      periods.length > 0 ? Math.max(...periods.map((p) => p.id)) + 1 : 1;
    const newPeriod: PeriodItem = {
      id: newId,
      label: newLabel,
      start: newStart + ":00",
      end: newEnd + ":00",
    };

    setPeriods([...periods, newPeriod]);

    if (isBreak) {
      const updatedBreaks = new Set(breakIds);
      updatedBreaks.add(newId);
      setBreakIds(updatedBreaks);
    }

    setNewLabel("");
    setNewStart("");
    setNewEnd("");
    setIsBreak(false);
  };

  const handleDelete = (id: number) => {
    setPeriods(periods.filter((p) => p.id !== id));
    if (breakIds.has(id)) {
      const updatedBreaks = new Set(breakIds);
      updatedBreaks.delete(id);
      setBreakIds(updatedBreaks);
    }
  };

  function formatDisplayTime(timeStr: string) {
    if (!timeStr) return "";
    try {
      const [h, m] = timeStr.split(":");
      let hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      hour = hour % 12;
      if (hour === 0) hour = 12;
      return `${hour}:${m} ${ampm}`;
    } catch {
      return timeStr;
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-slate-50 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Clock className="w-5 h-5 text-indigo-500" />
              Manage Period Schedule
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Configure the daily classes and breaks for the school timetable.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors self-start"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {periods.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No periods configured. Add one below.
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periods.map((p) => {
                      const isPeriodBreak = breakIds.has(p.id);
                      return (
                        <tr
                          key={p.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {p.label}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {formatDisplayTime(p.start)} -{" "}
                            {formatDisplayTime(p.end)}
                          </td>
                          <td className="px-4 py-3">
                            {isPeriodBreak ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/50">
                                Break
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50">
                                Class
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                              title="Delete Period"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-500" />
              Add New Period
            </h4>
            <div className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-4">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Period 1"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="col-span-2">
                <button
                  onClick={handleAdd}
                  disabled={!newLabel || !newStart || !newEnd}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreak}
                  onChange={(e) => setIsBreak(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-600 select-none">
                  This period is a Break/Lunch
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
