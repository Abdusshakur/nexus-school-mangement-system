import { useState } from "react";
import { Info } from "lucide-react";
import { mockProfile } from "../dashboard/data";
import { buildAttendanceRecords } from "./utils";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceTable } from "./components/AttendanceTable";

export function ParentAttendance() {
  const profile = mockProfile;
  const children = profile?.children ?? [];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedChild = children[selectedIdx];

  const records = selectedChild
    ? buildAttendanceRecords(selectedChild.name)
    : [];

  // Summary stats
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const late = records.filter((r) => r.status === "Late").length;
  const totalDays = 21; // this term so far

  return (
    <div className="space-y-5 max-w-5xl pb-10">
      {/* Page header */}
      <div>
        <h1 className="font-bold text-2xl text-slate-900">Attendance</h1>
        <p className="text-sm mt-0.5 text-slate-500">
          Track your children's school attendance
        </p>
      </div>

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {children.map((child, i) => (
            <button
              key={child.admNo}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                i === selectedIdx
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {child.name}
              <span className="ml-1.5 text-xs opacity-80">
                ({child.className})
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          <AttendanceStats
            present={present}
            absent={absent}
            late={late}
            totalDays={totalDays}
            recordsLength={records.length}
          />

          {/* Info notice */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm bg-blue-50 border border-blue-200 text-blue-800">
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Absences are only confirmed after admin verification. You will
              receive a notification for each confirmed absence.
            </p>
          </div>

          <AttendanceTable
            childName={selectedChild.name}
            records={records}
          />
        </>
      )}
    </div>
  );
}
