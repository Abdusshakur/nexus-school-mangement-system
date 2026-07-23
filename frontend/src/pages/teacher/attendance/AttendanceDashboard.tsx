import { MarkAttendance } from "./MarkAttendance";

export default function TeacherAttendance() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-0 overflow-y-auto">
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            Mark Attendance
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Take roll-call attendance for your assigned classrooms
          </p>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-5xl w-full ">
        <MarkAttendance />
      </main>
    </div>
  );
}
