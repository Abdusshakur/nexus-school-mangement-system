import { useState, useEffect } from "react";
import { ChevronDown, CalendarDays, Loader2 } from "lucide-react";
import { useTimetableStore, type TimetableCell, type TimetableKey } from "../../../store/timetable.store";
import { useAuthStore } from "../../../store/auth/authStore";
import { useClassStore } from "../../../store/class.store";

// ─── Period / day structure ────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const PERIODS = [
  { id: 1, label: "Period 1", time: "8:00 – 8:50 AM" },
  { id: 2, label: "Period 2", time: "9:00 – 9:50 AM" },
  { id: 3, label: "Period 3", time: "10:00 – 10:50 AM" },
  { id: 4, label: "Break",    time: "11:00 – 11:30 AM" },
  { id: 5, label: "Period 4", time: "11:30 AM – 12:20 PM" },
  { id: 6, label: "Period 5", time: "12:30 – 1:20 PM" },
  { id: 7, label: "Lunch",    time: "1:20 – 2:00 PM" },
  { id: 8, label: "Period 6", time: "2:00 – 2:50 PM" },
  { id: 9, label: "Period 7", time: "3:00 – 3:50 PM" },
];
const BREAK_IDS = new Set([4, 7]);

function ttKey(d: number, p: number): TimetableKey { return `${d}-${p}` as TimetableKey; }

// ─── Subject colours ──────────────────────────────────────────────────────────

const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Biology":              { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  "Basic Science":        { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  "Mathematics":          { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300" },
  "Further Mathematics":  { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-300" },
  "Physics":              { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  "Chemistry":            { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300" },
  "English Language":     { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  "Literature in English":{ bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-300" },
  "History":              { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  "Geography":            { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-300" },
  "Social Studies":       { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  "Government":           { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" },
  "Economics":            { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" },
  "Computer Science":     { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
  "Agricultural Science": { bg: "bg-yellow-50", text: "text-yellow-900", border: "border-yellow-300" },
};

function cellColor(sub: string) {
  return SUBJECT_COLORS[sub] ?? { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
}

// ─── Read-only grid ───────────────────────────────────────────────────────────

function TimetableGrid({ grid, highlightTeacherId }: {
  grid: Record<string, TimetableCell | undefined>;
  highlightTeacherId?: string;
}) {
  return (
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
                  const key = ttKey(d, p.id);
                  const cell = grid[key];
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
                  if (!cell) {
                    return (
                      <td key={d} className="p-1 min-w-[108px]">
                        <div className="border-[1.5px] border-dashed border-slate-200 rounded-xl min-h-[60px]" />
                      </td>
                    );
                  }
                  const cs = cellColor(cell.subject);
                  const isMine = highlightTeacherId ? cell.teacherId === highlightTeacherId : false;
                  
                  // Convert generic ring border for highlighting
                  const ringClass = isMine ? `ring-2 ring-offset-0 ${cs.border.replace('border-', 'ring-')}` : '';

                  return (
                    <td key={d} className="p-1 align-top min-w-[108px]">
                      <div className={`${cs.bg} border-[1.5px] ${cs.border} rounded-xl px-[9px] py-[7px] min-h-[60px] ${highlightTeacherId && !isMine ? 'opacity-35' : ''} ${ringClass}`}>
                        <p className={`text-[11px] font-bold ${cs.text} leading-tight`}>{cell.subject}</p>
                        <p className={`text-[10px] ${cs.text} opacity-80 mt-0.5`}>{cell.className}</p>
                        <p className={`text-[10px] ${cs.text} opacity-60 mt-[2px]`}>
                          {isMine ? (cell.room || cell.teacherName.split(" ").slice(-1)[0]) : cell.teacherName.split(" ").slice(-1)[0]}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TeacherTimetable() {
  const { timetableGrid, terms, loading, fetchTerms, fetchTimetable } = useTimetableStore();
  const { classes, loadClasses } = useClassStore();
  const { user } = useAuthStore();
  
  const MY_TEACHER_ID = user?.id || "";

  const [tab, setTab] = useState<"mine" | "school">("mine");
  const [term, setTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");

  useEffect(() => {
    fetchTerms();
    loadClasses();
  }, [fetchTerms, loadClasses]);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (terms.length > 0 && !term) {
      setTerm(terms[0]);
    }
  }, [terms, term]);

  useEffect(() => {
    if (term) {
      fetchTimetable(term);
    }
  }, [term, fetchTimetable]);

  // My timetable: map composite keys back to simple day-period for the grid
  const myGrid: Record<string, TimetableCell | undefined> = {};
  const schoolGrid: Record<string, TimetableCell | undefined> = {};

  Object.entries(timetableGrid).forEach(([key, cell]) => {
    if (!cell) return;
    const [classId, day, period] = key.split("-");
    const dpKey = `${day}-${period}`;
    
    if (cell.teacherId === MY_TEACHER_ID) {
      myGrid[dpKey] = cell;
    }
    if (classId === selectedClassId) {
      schoolGrid[dpKey] = cell;
    }
  });

  const myCells = Object.values(myGrid).filter(Boolean) as TimetableCell[];
  const mySubjects = [...new Set(myCells.map((c) => c.subject))];
  const myClasses  = [...new Set(myCells.map((c) => c.className))];

  // Stats cards
  const stats = [
    { label: "Periods / Week", value: myCells.length },
    { label: "Classes", value: myClasses.length },
    { label: "Subjects", value: mySubjects.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Timetable</h1>
          <p className="text-sm mt-0.5 text-slate-500">Managed by the school administrator</p>
        </div>
        
        {loading && terms.length === 0 ? (
          <Loader2 className="animate-spin text-slate-400" size={20} />
        ) : (
          <div className="flex gap-3">
            {tab === "school" && classes.length > 0 && (
              <div className="relative">
                <select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                  className="pl-3 pr-8 py-2 rounded-lg text-sm bg-white appearance-none font-medium border border-slate-200 text-slate-700 outline-none">
                  {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              </div>
            )}
            <div className="relative">
              <select value={term} onChange={(e) => setTerm(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg text-sm bg-white appearance-none font-medium border border-slate-200 text-slate-700 outline-none">
                {terms.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>
          </div>
        )}
      </div>

      {/* My summary cards — only on "mine" tab */}
      {tab === "mine" && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {stats.map(({ label, value }) => (
              <div key={label} className="bg-white rounded-xl p-4 text-center border border-slate-200">
                <p className="font-bold text-3xl text-indigo-600">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          {/* My classes + subjects badges */}
          {myCells.length > 0 && (
            <div className="bg-white rounded-xl p-4 flex flex-wrap gap-4 border border-slate-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-slate-400">My Classes</p>
                <div className="flex flex-wrap gap-1.5">
                  {myClasses.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-slate-400">My Subjects</p>
                <div className="flex flex-wrap gap-1.5">
                  {mySubjects.map((s) => {
                    const cs = cellColor(s);
                    return (
                      <span key={s} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cs.bg} ${cs.text} border ${cs.border}`}>{s}</span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Grid */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <div className="flex items-center border-b border-slate-100">
          {[
            { key: "mine",   label: "My Timetable" },
            { key: "school", label: "School Timetable" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as "mine" | "school")}
              className={`px-6 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                tab === t.key ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}>
              {t.label}
            </button>
          ))}
          <div className="ml-auto px-4">
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
              <CalendarDays size={11} /> View only
            </span>
          </div>
        </div>

        <div className="p-5">
          {tab === "mine" ? (
            myCells.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                No lessons assigned yet. The administrator will populate your timetable.
              </div>
            ) : (
              <TimetableGrid grid={myGrid} />
            )
          ) : (
            <TimetableGrid
              grid={schoolGrid}
              highlightTeacherId={MY_TEACHER_ID}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 border border-slate-200">
        <p className="text-xs font-semibold uppercase tracking-wide mb-3 text-slate-400">Subject Colour Guide</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(SUBJECT_COLORS).map(([sub, cs]) => (
            <span key={sub} className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cs.bg} ${cs.text} border ${cs.border}`}>
              {sub}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
