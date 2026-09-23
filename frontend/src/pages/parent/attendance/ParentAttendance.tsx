import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { useParentContextStore } from "../../../store/parentContext.store";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceTable } from "./components/AttendanceTable";
import { Skeleton } from "../../../components/ui/Skeleton";
import { type AttStatus } from "./utils";

export function ParentAttendance() {
  const { children, childAttendance, loadChildAttendance, loadChildren, loadingChildren, loadingAttendance } = useParentContextStore();
  const [selectedIdx, setSelectedIdx] = useState(0);
  
  const selectedChild = children[selectedIdx];
  const isLoadingRecords = selectedChild ? loadingAttendance[selectedChild.id] : false;

  useEffect(() => {
    if (children.length === 0) {
      loadChildren();
    }
  }, [children.length, loadChildren]);

  useEffect(() => {
    if (selectedChild && !childAttendance[selectedChild.id]) {
      loadChildAttendance(selectedChild.id);
    }
  }, [selectedChild, childAttendance, loadChildAttendance]);

  const rawRecords = selectedChild ? childAttendance[selectedChild.id] || [] : [];

  const records = rawRecords.map(r => {
     let status: AttStatus = "Present";
     if (r.status === "ABSENT") status = "Absent";
     if (r.status === "LATE") status = "Late";
     
     const d = new Date(r.date);
     return {
       date: d.toLocaleDateString("en-NG", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
       }),
       status
     }
  });

  const present = rawRecords.filter((r) => r.status === "PRESENT").length;
  const absent = rawRecords.filter((r) => r.status === "ABSENT").length;
  const late = rawRecords.filter((r) => r.status === "LATE").length;
  const totalDays = rawRecords.length;

  if (loadingChildren) {
    return (
      <div className="space-y-5 max-w-5xl pb-10">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

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
              key={child.id}
              onClick={() => setSelectedIdx(i)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                i === selectedIdx
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {child.first_name}
              <span className="ml-1.5 text-xs opacity-80">
                ({child.class_name})
              </span>
            </button>
          ))}
        </div>
      )}

      {selectedChild && (
        <>
          {isLoadingRecords ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          ) : (
            <AttendanceStats
              present={present}
              absent={absent}
              late={late}
              totalDays={totalDays}
            />
          )}

          {/* Info notice */}
          {isLoadingRecords ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm bg-blue-50 border border-blue-200 text-blue-800">
              <Info size={16} className="flex-shrink-0 mt-0.5" />
              <p>
                Absences are only confirmed after admin verification. You will
                receive a notification for each confirmed absence.
              </p>
            </div>
          )}

          {isLoadingRecords ? (
            <Skeleton className="h-64 w-full rounded-xl" />
          ) : (
            <AttendanceTable
              childName={selectedChild.first_name}
              records={records}
            />
          )}
        </>
      )}
    </div>
  );
}
