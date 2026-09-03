import { useState, useEffect } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import {
  useTimetableStore,
  type TimetableCell,
  type TimetableKey,
} from "../../../store/timetable.store";
import { useAuthStore } from "../../../store/auth/authStore";
import { useClassStore } from "../../../store/class.store";
import { useSessionStore } from "../../../store/session.store";
import { getSubjectColors } from "../../../utils/colors";
import { Skeleton } from "../../../components/ui/Skeleton";

// ─── Period / day structure ────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const PERIODS = [
  { id: 1, label: "Period 1" },
  { id: 2, label: "Period 2" },
  { id: 3, label: "Period 3" },
  { id: 4, label: "Break" },
  { id: 5, label: "Period 4" },
  { id: 6, label: "Period 5" },
  { id: 7, label: "Lunch" },
  { id: 8, label: "Period 6" },
  { id: 9, label: "Period 7" },
];
const BREAK_IDS = new Set([4, 7]);

function formatTime(timeStr?: string) {
  if (!timeStr) return "TBD";
  try {
    const [h, m] = timeStr.split(":");
    let hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    if (hour === 0) hour = 12;
    return `${hour}:${m} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}

function ttKey(d: number, p: number): TimetableKey {
  return `${d}-${p}` as TimetableKey;
}

function cellColor(sub: string) {
  return getSubjectColors(sub);
}

function MyTimetableGrid({
  grid,
}: {
  grid: Record<string, TimetableCell | undefined>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1.5">
        <thead>
          <tr>
            <th className="w-32 pb-2.5 text-left text-sm text-slate-400 font-semibold uppercase tracking-wider">
              Period
            </th>
            {SHORT.map((d) => (
              <th
                key={d}
                className="pb-2.5 text-center text-sm text-slate-900 font-bold"
              >
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((p) => {
            const isBreak = BREAK_IDS.has(p.id);
            
            // Get dynamic time from any cell in this row
            let dynamicTime = "";
            for (let d = 0; d < DAYS.length; d++) {
              const cell = grid[ttKey(d, p.id)];
              if (cell && cell.startTime && cell.endTime) {
                dynamicTime = `${formatTime(cell.startTime)} - ${formatTime(cell.endTime)}`;
                break;
              }
            }

            return (
              <tr key={p.id}>
                <td className="align-middle pr-2">
                  <p className="text-sm font-semibold text-slate-700">
                    {p.label}
                  </p>
                  {dynamicTime && (
                    <p className="text-[10px] text-slate-400">{dynamicTime}</p>
                  )}
                </td>
                {DAYS.map((_, d) => {
                  const key = ttKey(d, p.id);
                  const cell = grid[key];
                  if (isBreak) {
                    if (d !== 0) return null;
                    return (
                      <td key={d} colSpan={5} className="p-1">
                        <div className="bg-slate-100 rounded-xl px-3 py-2 text-center">
                          <p className="text-[11px] font-semibold text-slate-400">
                            {p.label}
                          </p>
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

                  return (
                    <td key={d} className="p-1 align-top min-w-[108px]">
                      <div
                        className={`${cs.bg} border-[1.5px] ${cs.border} rounded-xl px-2.5 py-2 min-h-[60px]`}
                      >
                        <p
                          className={`text-[11px] font-bold ${cs.text} leading-tight`}
                        >
                          {cell.subject}
                        </p>
                        <p
                          className={`text-[10px] ${cs.text} opacity-80 mt-0.5`}
                        >
                          {cell.className}
                        </p>
                        <p
                          className={`text-[10px] ${cs.text} opacity-60 mt-0.5`}
                        >
                          {cell.room ||
                            cell.teacherName.split(" ").slice(-1)[0]}
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

function SchoolTimetableGrid({
  grid,
  classes,
  activeDay,
  highlightTeacherId,
  loading,
}: {
  grid: Record<string, TimetableCell | undefined>;
  classes: { id: string; name: string }[];
  activeDay: number;
  highlightTeacherId: string;
  loading: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1.5 min-w-[800px]">
        <thead>
          <tr>
            <th className="w-[120px] pb-2.5 text-left text-[11px] text-slate-400 font-semibold uppercase tracking-wider sticky left-0 bg-white z-10">
              Period
            </th>
            {classes.map((c) => (
              <th
                key={c.id}
                className="pb-2.5 text-center text-[12px] text-slate-900 font-bold min-w-[120px]"
              >
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <tr key={i}>
                  <td className="pr-2 py-3">
                    <Skeleton className="h-6 w-16" />
                  </td>
                  {classes.length > 0
                    ? classes.map((c) => (
                        <td key={c.id} className="p-1">
                          <Skeleton className="h-[76px] w-full rounded-xl" />
                        </td>
                      ))
                    : [1, 2, 3].map((j) => (
                        <td key={j} className="p-1">
                          <Skeleton className="h-[76px] w-full rounded-xl" />
                        </td>
                      ))}
                </tr>
              ))}
            </>
          ) : PERIODS.map((p) => {
            const isBreak = BREAK_IDS.has(p.id);
            
            let dynamicTime = "";
            for (const c of classes) {
              const dpKey = `${c.id}-${activeDay}-${p.id}`;
              const cell = grid[dpKey];
              if (cell && cell.startTime && cell.endTime) {
                dynamicTime = `${formatTime(cell.startTime)} - ${formatTime(cell.endTime)}`;
                break;
              }
            }

            return (
              <tr key={p.id}>
                <td className="align-middle pr-2 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <p className="text-[11px] font-semibold text-slate-700">
                    {p.label}
                  </p>
                  {dynamicTime && (
                    <p className="text-[10px] text-slate-400">{dynamicTime}</p>
                  )}
                </td>
                  {isBreak ? (
                    <td colSpan={classes.length} className="p-1">
                      <div className="bg-slate-100 rounded-xl px-3 py-2 text-center shadow-inner">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                          {p.label}
                        </p>
                      </div>
                    </td>
                  ) : (
                    classes.map((c) => {
                      const dpKey = `${c.id}-${activeDay}-${p.id}`;
                      const cell = grid[dpKey];

                      if (!cell) {
                        return (
                          <td key={c.id} className="p-1 align-top">
                            <div className="border-[1.5px] border-dashed border-slate-200 rounded-xl min-h-[70px]" />
                          </td>
                        );
                      }

                      const isSelected = highlightTeacherId
                        ? cell.teacherId === highlightTeacherId
                        : false;
                      const cs = cellColor(cell.subject);
                      const ringClass = isSelected
                        ? `ring-2 ring-offset-1 ring-indigo-500 shadow-md`
                        : "";

                      return (
                        <td key={c.id} className="p-1 align-top">
                          <div
                            className={`${cs.bg} border-[1.5px] ${cs.border} rounded-xl px-2.5 py-2 min-h-[70px] ${!isSelected ? "opacity-35" : ""} ${ringClass}`}
                          >
                            <p
                              className={`text-[11px] font-bold ${cs.text} leading-tight`}
                            >
                              {cell.subject}
                            </p>
                            <p
                              className={`text-[10px] ${cs.text} opacity-80 mt-1`}
                            >
                              {cell.teacherName}
                            </p>
                          </div>
                        </td>
                      );
                    })
                  )}
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TeacherTimetable() {
  const {
    timetableGrid,
    myTimetableGrid,
    terms,
    loading,
    fetchTerms,
    fetchAllTimetables,
    fetchMyTimetable,
  } = useTimetableStore();
  const { classes, loading: classLoading, loadClasses } = useClassStore();
  const { user } = useAuthStore();
  const { academicSessions, fetchSessions } = useSessionStore();

  const MY_TEACHER_ID = user?.id || "";

  const [tab, setTab] = useState<"mine" | "school">("mine");
  const [selectedTermId, setSelectedTermId] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  const activeTermId =
    selectedTermId ||
    academicSessions.find((s) => s.status === "active")?.termId ||
    "";

  useEffect(() => {
    fetchTerms();
    loadClasses();
    fetchSessions();
  }, [fetchTerms, loadClasses, fetchSessions]);

  useEffect(() => {
    if (activeTermId) {
      fetchMyTimetable(activeTermId);
    }
  }, [activeTermId, fetchMyTimetable]);

  useEffect(() => {
    if (tab === "school" && classes.length > 0 && activeTermId) {
      fetchAllTimetables(
        classes.map((c) => c.id),
        activeTermId,
      );
    }
  }, [tab, classes, activeTermId, fetchAllTimetables]);

  const myGrid = myTimetableGrid || {};
  const myCells = Object.values(myGrid).filter(Boolean) as TimetableCell[];
  const mySubjects = [...new Set(myCells.map((c) => c.subject))];
  const myClasses = [...new Set(myCells.map((c) => c.className))];

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
          <p className="text-sm mt-0.5 text-slate-500">
            Managed by the school administrator
          </p>
        </div>

        {loading && terms.length === 0 ? (
          <Loader2 className="animate-spin text-slate-400" size={20} />
        ) : (
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={activeTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg text-sm bg-white appearance-none font-medium border border-slate-200 text-slate-700 outline-none"
              >
                {academicSessions.map((s) => (
                  <option key={s.termId} value={s.termId}>
                    {s.term}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* My summary cards — only on "mine" tab */}
      {tab === "mine" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map(({ label, value }) => (
              <div
                key={label}
                className="bg-white rounded-xl p-4 text-center border border-slate-200"
              >
                <p className="font-bold text-3xl text-indigo-600">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          {/* My classes + subjects badges */}
          {myCells.length > 0 && (
            <div className="bg-white rounded-xl p-4 flex flex-col sm:flex-row sm:flex-wrap gap-4 border border-slate-200">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-slate-400">
                  My Classes
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {myClasses.map((c) => (
                    <span
                      key={c}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-slate-400">
                  My Subjects
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {mySubjects.map((s) => {
                    const cs = cellColor(s);
                    return (
                      <span
                        key={s}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${cs.bg} ${cs.text} border ${cs.border}`}
                      >
                        {s}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Grid container */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100">
          <div className="flex items-center">
            {[
              { key: "mine", label: "My Timetable" },
              { key: "school", label: "School Timetable" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "mine" | "school")}
                className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  tab === t.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "school" && (
            <div className="px-4 py-2 sm:py-0 border-t sm:border-t-0 border-slate-100 bg-slate-50/50 sm:bg-transparent">
              <div className="flex gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 max-w-full overflow-x-auto">
                {DAYS.map((day, idx) => (
                  <button
                    key={day}
                    onClick={() => setActiveDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      activeDay === idx
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {SHORT[idx]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          {tab === "mine" ? (
            myCells.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                No lessons assigned yet. The administrator will populate your
                timetable.
              </div>
            ) : (
              <MyTimetableGrid grid={myGrid} />
            )
          ) : (
            <SchoolTimetableGrid
              grid={timetableGrid}
              classes={classes}
              activeDay={activeDay}
              highlightTeacherId={MY_TEACHER_ID}
              loading={classLoading || loading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
