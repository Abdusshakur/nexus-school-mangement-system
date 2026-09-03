import { useState, useEffect } from "react";
import { ChevronDown, Edit3, X, Save, Trash2, Plus } from "lucide-react";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Spinner } from "../../../components/ui/Spinner";
import { getSubjectColors } from "../../../utils/colors";
import {
  useTimetableStore,
  type TimetableCell,
} from "../../../store/timetable.store";
import { useClassStore } from "../../../store/class.store";
import { useTeacherStore } from "../../../store/teacher.store";
import { useSubjectStore } from "../../../store/subject.store";
import { useSessionStore } from "../../../store/session.store";
import { toast } from "sonner";
import { ManagePeriodsModal, type PeriodItem } from "./ManagePeriodsModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ENUM_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

const INITIAL_PERIODS: PeriodItem[] = [
  {
    id: 1,
    label: "Period 1",
    start: "08:00:00",
    end: "08:50:00",
  },
  {
    id: 2,
    label: "Period 2",
    start: "09:00:00",
    end: "09:50:00",
  },
  {
    id: 3,
    label: "Period 3",
    start: "10:00:00",
    end: "10:50:00",
  },
  {
    id: 4,
    label: "Break",
    start: "11:00:00",
    end: "11:30:00",
  },
  {
    id: 5,
    label: "Period 4",
    start: "11:30:00",
    end: "12:20:00",
  },
  {
    id: 6,
    label: "Period 5",
    start: "12:30:00",
    end: "13:20:00",
  },
  {
    id: 7,
    label: "Lunch",
    start: "13:20:00",
    end: "14:00:00",
  },
  {
    id: 8,
    label: "Period 6",
    start: "14:00:00",
    end: "14:50:00",
  },
  {
    id: 9,
    label: "Period 7",
    start: "15:00:00",
    end: "15:50:00",
  },
];
const INITIAL_BREAK_IDS = new Set([4, 7]);

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

function cellColor(sub: string) {
  return getSubjectColors(sub);
}

export function AdminTimetable() {
  const {
    timetableGrid,
    loading: timetableLoading,
    fetchTerms,
    fetchAllTimetables,
    saveTimetableCell,
  } = useTimetableStore();
  const { classes, loading: classLoading, loadClasses } = useClassStore();
  const { teachers, fetchTeachers } = useTeacherStore();
  const { subjects, loadSubjects } = useSubjectStore();
  const { academicSessions, fetchSessions } = useSessionStore();

  const [periods, setPeriods] = useState<PeriodItem[]>(INITIAL_PERIODS);
  const [breakIds, setBreakIds] = useState<Set<number>>(INITIAL_BREAK_IDS);
  const [isManagePeriodsOpen, setIsManagePeriodsOpen] = useState(false);

  const [selectedTermId, setSelectedTermId] = useState("");
  const [activeDay, setActiveDay] = useState(0);

  // Edit Modal
  const [editCell, setEditCell] = useState<{
    classId: string;
    period: number;
    cellKey: string;
  } | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editTeacher, setEditTeacher] = useState("");
  const [editRoom, setEditRoom] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTerms();
    loadClasses();
    fetchTeachers();
    loadSubjects();
    fetchSessions();
  }, [fetchTerms, loadClasses, fetchTeachers, loadSubjects, fetchSessions]);

  const activeTermId =
    selectedTermId ||
    academicSessions.find((s) => s.status === "active")?.termId ||
    "";

  useEffect(() => {
    if (classes.length > 0 && activeTermId) {
      fetchAllTimetables(
        classes.map((c) => c.id),
        activeTermId,
      );
    }
  }, [classes, activeTermId, fetchAllTimetables]);

  const handleCellClick = (classId: string, p: number) => {
    const cellKey = `${classId}-${activeDay}-${p}`;
    const existing = timetableGrid[cellKey];

    setEditCell({ classId, period: p, cellKey });
    setEditSubject(existing?.subjectId || existing?.subject || "");
    setEditTeacher(existing?.teacherId || "");
    setEditRoom(existing?.room || "");
  };

  const handleSaveCell = async () => {
    if (!editCell || !editSubject || !editTeacher) return;
    if (!activeTermId) {
      toast.error("No active term found");
      return;
    }

    setIsSaving(true);
    try {
      const teacher = teachers.find((t) => t.id === editTeacher);
      const subject = subjects.find((s) => s.id === editSubject);
      const activeClass = classes.find((c) => c.id === editCell.classId);
      const cell: TimetableCell = {
        subject: subject?.name || editSubject,
        subjectId: editSubject,
        teacherId: editTeacher,
        teacherName: teacher?.name || "",
        className: activeClass?.name || "",
        room: editRoom || undefined,
      };

      const period = periods.find((p) => p.id === editCell.period);
      if (!period || !period.start || !period.end) {
        throw new Error("Invalid period selected");
      }

      await saveTimetableCell(
        activeTermId,
        editCell.classId,
        activeDay,
        ENUM_DAYS[activeDay],
        period.start,
        period.end,
        editCell.period,
        cell,
      );
      toast.success("Lesson assigned successfully");
      setEditCell(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save assignment",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCell = async () => {
    if (!editCell) return;
    if (!activeTermId) {
      toast.error("No active term found");
      return;
    }

    setIsSaving(true);
    try {
      const period = periods.find((p) => p.id === editCell.period);
      if (!period || !period.start || !period.end) {
        throw new Error("Invalid period selected");
      }

      await saveTimetableCell(
        activeTermId,
        editCell.classId,
        activeDay,
        ENUM_DAYS[activeDay],
        period.start,
        period.end,
        editCell.period,
        undefined,
      );
      toast.success("Lesson cleared");
      setEditCell(null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to clear assignment",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5 p-6 max-w-[100vw] mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">
            General Timetable
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            Create and manage the school's master timetable.
          </p>
        </div>

        {academicSessions.length === 0 ? (
          <Spinner size="md" className="text-slate-400" />
        ) : (
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={activeTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="pl-3 pr-8 py-2.5 rounded-lg text-sm bg-white appearance-none font-medium shadow-sm transition-colors cursor-pointer focus:ring-2 focus:ring-indigo-500/20 border border-slate-200 text-slate-700 outline-none"
              >
                {academicSessions.flatMap((s) =>
                  s.terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({s.name})
                    </option>
                  )),
                )}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Day Slider */}
      <div className="flex justify-center my-6">
        <div className="inline-flex bg-slate-100/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-inner border border-slate-200/60 max-w-full overflow-x-auto">
          {DAYS.map((day, idx) => (
            <button
              key={day}
              onClick={() => setActiveDay(idx)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                activeDay === idx
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
        <div className="flex items-center border-b border-slate-100">
          <div className="px-6 py-4 text-sm font-semibold flex items-center gap-2 text-slate-900">
            {DAYS[activeDay]}'s Schedule
          </div>
          <div className="ml-auto px-4 flex items-center gap-3">
            <button
              onClick={() => setIsManagePeriodsOpen(true)}
              className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              Manage Period Schedule
            </button>
            <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600">
              <Edit3 size={12} /> Master Editing
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-6">
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
                {classLoading || timetableLoading ? (
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
                ) : (
                  periods.map((p) => {
                    const isBreak = breakIds.has(p.id);

                    // Dynamically resolve time based on the first cell that has it, or fallback to default
                    let dynamicTime = `${formatTime(p.start)} - ${formatTime(p.end)}`;
                    for (const c of classes) {
                      const dpKey = `${c.id}-${activeDay}-${p.id}`;
                      const cell = timetableGrid[dpKey];
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
                          <p className="text-[10px] text-slate-400">
                            {dynamicTime}
                          </p>
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
                            const cell = timetableGrid[dpKey];

                            return (
                              <td
                                key={c.id}
                                className="p-1 align-top cursor-pointer"
                                onClick={() => handleCellClick(c.id, p.id)}
                              >
                                {!cell ? (
                                  <div className="group transition-all hover:bg-slate-50 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl min-h-[70px]">
                                    <Plus
                                      size={16}
                                      className="text-slate-300 group-hover:text-indigo-400 transition-colors"
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className={`group relative transition-all hover:shadow-md ${cellColor(cell.subject).bg} border-2 ${cellColor(cell.subject).border} rounded-xl px-2.5 py-2 min-h-[70px]`}
                                  >
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded p-1">
                                      <Edit3
                                        size={10}
                                        className="text-slate-600"
                                      />
                                    </div>
                                    <p
                                      className={`text-[11px] font-bold ${cellColor(cell.subject).text} leading-tight`}
                                    >
                                      {cell.subject}
                                    </p>
                                    <p
                                      className={`text-[10px] ${cellColor(cell.subject).text} opacity-80 mt-1`}
                                    >
                                      {cell.teacherName}
                                    </p>
                                  </div>
                                )}
                              </td>
                            );
                          })
                        )}
                      </tr>
                    );
                  })
                )}
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
                {DAYS[activeDay]} -{" "}
                {periods.find((p) => p.id === editCell.period)?.label}
              </h2>
              <button
                onClick={() => setEditCell(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="px-4 py-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-center">
                <span className="text-[13px] font-semibold text-indigo-900">
                  {classes.find((c) => c.id === editCell.classId)?.name}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Subject
                </label>
                <select
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select a subject...</option>

                  {(() => {
                    const selectedTeacher = teachers.find(
                      (t) => t.id === editTeacher,
                    );
                    const assigned = subjects.filter((s) =>
                      selectedTeacher?.subjects.includes(s.name),
                    );
                    const others = subjects.filter(
                      (s) => !selectedTeacher?.subjects.includes(s.name),
                    );

                    if (!selectedTeacher) {
                      return subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ));
                    }

                    if (assigned.length === 0) {
                      return (
                        <>
                          <optgroup
                            label="No subjects assigned"
                            className="text-red-500"
                          >
                            <option disabled value="warning">
                              Update profile to assign
                            </option>
                          </optgroup>
                          <optgroup label="All Subjects">
                            {others.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      );
                    }

                    return (
                      <>
                        <optgroup label="Assigned to this Teacher">
                          {assigned.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other Subjects">
                          {others.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    );
                  })()}

                  {/* Fallback to some defaults if backend empty */}
                  {subjects.length === 0 &&
                    ["Mathematics", "English", "Science", "History"].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ),
                    )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Teacher
                </label>
                <select
                  value={editTeacher}
                  onChange={(e) => setEditTeacher(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                >
                  <option value="">Assign a teacher...</option>
                  {(() => {
                    const selectedSubjectObj = subjects.find(
                      (s) => s.id === editSubject,
                    );
                    const assigned = teachers.filter(
                      (t) =>
                        selectedSubjectObj &&
                        t.subjects.includes(selectedSubjectObj.name),
                    );
                    const others = teachers.filter(
                      (t) =>
                        !selectedSubjectObj ||
                        !t.subjects.includes(selectedSubjectObj.name),
                    );

                    if (!selectedSubjectObj) {
                      return teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ));
                    }

                    if (assigned.length === 0) {
                      return (
                        <>
                          <optgroup
                            label="No teachers assigned"
                            className="text-red-500"
                          >
                            <option disabled value="warning">
                              Assign in teacher profiles
                            </option>
                          </optgroup>
                          <optgroup label="All Teachers">
                            {others.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </optgroup>
                        </>
                      );
                    }

                    return (
                      <>
                        <optgroup
                          label={`Assigned to ${selectedSubjectObj.name}`}
                        >
                          {assigned.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Other Teachers">
                          {others.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    );
                  })()}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveCell}
                  disabled={!editSubject || !editTeacher || isSaving}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" className="text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save
                    </>
                  )}
                </button>
                {timetableGrid[editCell.cellKey] && (
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
      <ManagePeriodsModal
        isOpen={isManagePeriodsOpen}
        onClose={() => setIsManagePeriodsOpen(false)}
        periods={periods}
        setPeriods={setPeriods}
        breakIds={breakIds}
        setBreakIds={setBreakIds}
      />
    </div>
  );
}
