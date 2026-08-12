import { useState, useEffect } from "react";
import { ChevronDown, Loader2, Edit3, X, Save, Trash2, Plus } from "lucide-react";
import { useTimetableStore, type TimetableCell, type TimetableKey } from "../../../store/timetable.store";
import { useClassStore } from "../../../store/class.store";
import { useTeacherStore } from "../../../store/teacher.store";
import { useSubjectStore } from "../../../store/subject.store";
import { toast } from "sonner";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const PERIODS = [
  { id: 1, label: "Period 1", time: "8:00 – 8:50 AM" },
  { id: 2, label: "Period 2", time: "9:00 – 9:50 AM" },
  { id: 3, label: "Period 3", time: "10:00 – 10:50 AM" },
  { id: 4, label: "Break", time: "11:00 – 11:30 AM" },
  { id: 5, label: "Period 4", time: "11:30 AM – 12:20 PM" },
  { id: 6, label: "Period 5", time: "12:30 – 1:20 PM" },
  { id: 7, label: "Lunch", time: "1:20 – 2:00 PM" },
  { id: 8, label: "Period 6", time: "2:00 – 2:50 PM" },
  { id: 9, label: "Period 7", time: "3:00 – 3:50 PM" },
];
const BREAK_IDS = new Set([4, 7]);

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Biology": { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  "Basic Science": { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  "Mathematics": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300" },
  "Further Mathematics": { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-300" },
  "Physics": { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  "Chemistry": { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300" },
  "English Language": { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  "Literature in English": { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-300" },
  "History": { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  "Geography": { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-300" },
  "Social Studies": { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  "Government": { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" },
  "Economics": { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" },
  "Computer Science": { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  "Agricultural Science": { bg: "bg-yellow-50", text: "text-yellow-900", border: "border-yellow-300" },
};

function cellColor(sub: string) {
  return SUBJECT_COLORS[sub] ?? { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
}

export function AdminTimetable() {
  const { timetableGrid, terms, loading, fetchTerms, fetchTimetable, saveTimetableCell } = useTimetableStore();
  const { classes, loadClasses } = useClassStore();
  const { teachers, fetchTeachers } = useTeacherStore();
  const { subjects, loadSubjects } = useSubjectStore();

  const [term, setTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  // Edit Modal State
  const [editCell, setEditCell] = useState<{ day: number, period: number, cellKey: TimetableKey } | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTerms();
    loadClasses();
    fetchTeachers();
    loadSubjects();
  }, [fetchTerms, loadClasses, fetchTeachers, loadSubjects]);

  const activeClassId = selectedClassId || (classes.length > 0 ? classes[0].id : "");
  const activeClass = classes.find(c => c.id === activeClassId) || null;
  const activeTerm = term || (terms.length > 0 ? terms[0] : "");

  useEffect(() => {
    if (activeTerm) {
      fetchTimetable(activeTerm);
    }
  }, [activeTerm, fetchTimetable]);

  const schoolGrid: Record<string, TimetableCell | undefined> = {};
  Object.entries(timetableGrid).forEach(([key, cell]) => {
    if (!cell) return;
    const [classId, day, period] = key.split("-");
    const dpKey = `${day}-${period}`;
    if (classId === activeClassId) {
      schoolGrid[dpKey] = cell;
    }
  });

  const handleCellClick = (d: number, p: number) => {
    if (!activeTerm || !activeClassId) return;

    const cellKey = `${activeClassId}-${d}-${p}`;
    const existing = timetableGrid[cellKey];

    setEditCell({ day: d, period: p, cellKey });
    setEditSubject(existing?.subject || "");
    setEditTeacher(existing?.teacherId || "");
    setEditRoom(existing?.room || "");
  };

  const handleSaveCell = async () => {
    if (!editCell || !editSubject || !editTeacher) return;

    setIsSaving(true);
    try {
      const teacher = teachers.find(t => t.id === editTeacher);
      const cell: TimetableCell = {
        subject: editSubject,
        teacherId: editTeacher,
        teacherName: teacher?.name || "",
        className: activeClass?.name || "",
        room: editRoom || undefined,
      };

      await saveTimetableCell(activeTerm, editCell.cellKey, cell);
      toast.success("Lesson assigned successfully");
      setEditCell(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to save assignment");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCell = async () => {
    if (!editCell) return;
    setIsSaving(true);
    try {
      await saveTimetableCell(activeTerm, editCell.cellKey, undefined);
      toast.success("Lesson cleared");
      setEditCell(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to clear assignment");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Timetable Builder</h1>
          <p className="text-sm mt-0.5 text-slate-500">Assign teachers and subjects to class periods</p>
        </div>

        {loading && terms.length === 0 ? (
          <Loader2 className="animate-spin text-slate-400" size={20} />
        ) : (
          <div className="flex gap-3">
            {classes.length > 0 && (
              <div className="relative">
                <select value={activeClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                  className="pl-3 pr-8 py-2.5 rounded-lg text-sm bg-white appearance-none font-medium shadow-sm transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 text-slate-700 outline-none">
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            )}
            <div className="relative">
              <select value={activeTerm} onChange={(e) => setTerm(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-lg text-sm bg-white appearance-none font-medium shadow-sm transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 text-slate-700 outline-none">
                {terms.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <div className="flex items-center border-b border-slate-100">
          <div className="px-6 py-4 text-sm font-semibold flex items-center gap-2 text-slate-900">
            {activeClass?.name || "Select a class"} Timetable
          </div>
          <div className="ml-auto px-4">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Edit3 size={12} /> Edit mode
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1.5">
              <thead>
                <tr>
                  <th className="w-[120px] pb-2.5 text-left text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Period</th>
                  {SHORT.map((d) => (
                    <th key={d} className="pb-2.5 text-center text-[12px] text-slate-900 font-bold">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((p) => {
                  const isBreak = BREAK_IDS.has(p.id);
                  return (
                    <tr key={p.id}>
                      <td className="align-middle pr-2">
                        <p className="text-[11px] font-semibold text-slate-700">{p.label}</p>
                        <p className="text-[10px] text-slate-400">{p.time}</p>
                      </td>
                      {DAYS.map((_, d) => {
                        if (isBreak) {
                          if (d !== 0) return null;
                          return (
                            <td key={d} colSpan={5} className="p-1">
                              <div className="bg-slate-100 rounded-xl px-3 py-2 text-center">
                                <p className="text-[11px] font-semibold text-slate-400">{p.label}</p>
                              </div>
                            </td>
                          );
                        }

                        const dpKey = `${d}-${p.id}`;
                        const cell = schoolGrid[dpKey];

                        return (
                          <td key={d} className="p-1 align-top min-w-[120px] cursor-pointer" onClick={() => handleCellClick(d, p.id)}>
                            {!cell ? (
                              <div className="group transition-all hover:bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl min-h-[70px]">
                                <Plus size={16} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                              </div>
                            ) : (
                              <div className={`group relative transition-all hover:shadow-md ${cellColor(cell.subject).bg} border-2 ${cellColor(cell.subject).border} rounded-xl px-2.5 py-2 min-h-[70px]`}>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1">
                                  <Edit3 size={10} className="text-slate-600" />
                                </div>
                                <p className={`text-[11px] font-bold ${cellColor(cell.subject).text} leading-tight`}>{cell.subject}</p>
                                <p className={`text-[10px] ${cellColor(cell.subject).text} opacity-80 mt-1`}>{cell.teacherName}</p>
                                {cell.room && (
                                  <p className={`text-[10px] ${cellColor(cell.subject).text} opacity-60 mt-0.5`}>{cell.room}</p>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="font-bold text-[17px] text-slate-900">
                {DAYS[editCell.day]} - {PERIODS.find(p => p.id === editCell.period)?.label}
              </h2>
              <button onClick={() => setEditCell(null)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Subject</label>
                <div className="relative">
                  <select
                    value={editSubject}
                    onChange={e => setEditSubject(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    {/* Add fallback to predefined subjects if empty backend */}
                    {subjects.length === 0 && Object.keys(SUBJECT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-slate-700">Teacher</label>
                <div className="relative">
                  <select
                    value={editTeacher}
                    onChange={e => setEditTeacher(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer appearance-none"
                  >
                    <option value="">Select a teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                </div>
              </div>



              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveCell}
                  disabled={!editSubject || !editTeacher || isSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save
                </button>
                {(editSubject || editTeacher) && (
                  <button
                    onClick={handleClearCell}
                    disabled={isSaving}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center cursor-pointer"
                    title="Clear lesson"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
