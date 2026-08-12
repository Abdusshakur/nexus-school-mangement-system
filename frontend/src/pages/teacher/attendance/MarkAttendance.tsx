import { useEffect, useState } from "react";
import { Check, X, Clock, CheckCircle, Save } from "lucide-react";
import type { StudentAttendance } from "./data";
import { DEFAULT_ROSTER } from "./data";
import { useAttendanceStore } from "../../../store/attendance.store";
import { fetchStudentsList } from "../../../api/students";
import { submitBulkAttendance } from "../../../api/attendance";
import { toast } from "sonner";

const CLASS_MAPPING: Record<string, string> = {
  "Advanced Mathematics III": "SS 3",
  "Physics & Thermodynamics": "SS 1",
  "Computer Programming II": "SS 2",
};

export function MarkAttendance() {
  const [selectedClass, setSelectedClass] = useState(
    "Physics & Thermodynamics",
  );
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [roster, setRoster] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const { saveHistory } = useAttendanceStore();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    const dbClass = CLASS_MAPPING[selectedClass] || "SS 1";
    fetchStudentsList(undefined, dbClass)
      .then((data) => {
        if (!isMounted) return;
        if (data && data.length > 0) {
          const initial = data.map((s) => ({
            id: s.id,
            name: `${s.first_name} ${s.last_name}`,
            avatar: `${s.first_name[0]}${s.last_name[0]}`.toUpperCase(),
            status: "Present" as const,
          }));
          setRoster(initial);
        } else {
          setRoster(DEFAULT_ROSTER.map((s) => ({ ...s, status: "Present" as const })));
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) {
          setRoster(DEFAULT_ROSTER.map((s) => ({ ...s, status: "Present" as const })));
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedClass, selectedDate]);

  const updateStatus = (id: string, status: StudentAttendance["status"]) => {
    const updated = roster.map((s) => (s.id === id ? { ...s, status } : s));
    setRoster(updated);
    setIsSaved(false);
  };

  const handleSave = async () => {
    setIsSaved(false);
    const dbClass = CLASS_MAPPING[selectedClass] || "SS 1";

    const payload = {
      attendance_date: selectedDate,
      class_name: dbClass,
      records: roster.map((r) => ({
        student_id: r.id,
        status: (r.status === "Present"
          ? "PRESENT"
          : r.status === "Absent"
            ? "ABSENT"
            : "LATE") as "PRESENT" | "ABSENT" | "LATE",
      })),
    };

    try {
      await submitBulkAttendance(payload);

      const presentCount = roster.filter(
        (s) => s.status === "Present" || s.status === "Late",
      ).length;
      const rate = Math.round((presentCount / roster.length) * 100);

      saveHistory({
        class: selectedClass,
        date: selectedDate,
        rate,
        present: presentCount,
        total: roster.length,
      });

      setIsSaved(true);
      toast.success(`Attendance for ${selectedClass} saved successfully!`);
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit attendance logs.");
    }
  };

  const presentCount = roster.filter((r) => r.status === "Present").length;
  const absentCount = roster.filter((r) => r.status === "Absent").length;
  const lateCount = roster.filter((r) => r.status === "Late").length;

  return (
    <div className="space-y-6">
      {/* Class and Date Selectors */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 text-xs font-bold mb-1.5 uppercase tracking-wider">
            Assigned Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 h-12"
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
            Attendance Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50 h-12"
            />
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wider">
            Present
          </span>
          <span className="text-2xl font-extrabold text-slate-800 block mt-1">
            {presentCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
            Absent
          </span>
          <span className="text-2xl font-extrabold text-slate-800 block mt-1">
            {absentCount}
          </span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
          <span className="text-[10px] font-bold text-amber-600 block uppercase tracking-wider">
            Late
          </span>
          <span className="text-2xl font-extrabold text-slate-800 block mt-1">
            {lateCount}
          </span>
        </div>
      </div>

      {/* Roster list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-base">
            Class Roster
          </h3>
          <span className="text-slate-400 text-xs font-semibold">
            {roster.length} students enrolled
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse text-sm">
              Loading class roster from database...
            </div>
          ) : roster.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              No students enrolled in this class.
            </div>
          ) : (
            roster.map((student) => (
              <div
                key={student.id}
                className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0 shadow-sm">
                    {student.avatar}
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 text-sm">
                      {student.name}
                    </p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      ID: {student.id}
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(student.id, "Present")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${student.status === "Present"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    <Check size={14} /> Present
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, "Absent")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${student.status === "Absent"
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/10"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    <X size={14} /> Absent
                  </button>
                  <button
                    onClick={() => updateStatus(student.id, "Late")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${student.status === "Late"
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    <Clock size={14} /> Late
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Review carefully before saving. Changes immediately sync with parent
            portals.
          </span>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${isSaved
                ? "bg-indigo-600 text-white shadow-indigo-600/10"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
              }`}
          >
            {isSaved ? <CheckCircle size={16} /> : <Save size={16} />}
            {isSaved ? "Saved Successfully" : "Submit Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}
