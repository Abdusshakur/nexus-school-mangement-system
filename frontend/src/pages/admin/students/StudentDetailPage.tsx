import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { ArrowLeft, Calendar, ChevronDown, Users } from "lucide-react";
import { STUDENT_DB, SESSIONS } from "./data";
import { ProfileTab } from "./tabs/ProfileTab";
import { ResultsTab } from "./tabs/ResultsTab";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { CoursesTab } from "./tabs/CoursesTab";

type ProfileTab = "profile" | "results" | "attendance" | "courses";

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const student = id ? STUDENT_DB[id] : null;
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [session, setSession] = useState(SESSIONS[0]);
  const [sessionOpen, setSessionOpen] = useState(false);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Users size={40} className="mb-3 opacity-40" />
        <p className="mb-4 text-sm">Student not found.</p>
        <Link
          to={ROUTES.ADMIN.STUDENTS}
          className="font-medium text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Students
        </Link>
      </div>
    );
  }

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "results", label: "Results" },
    { id: "attendance", label: "Attendance" },
    { id: "courses", label: "Courses" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to={ROUTES.ADMIN.STUDENTS}
          className="p-2 rounded-lg transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate text-[22px] text-slate-900">
            {student.name}
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            {student.id} · {student.grade} · {student.gender}
          </p>
        </div>

        {/* Session selector */}
        <div className="flex gap-2">
          {/* <button className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg text-sm font-medium border transition-all border-slate-300 text-slate-700 bg-white hover:bg-slate-200">
            Edit
            <Pencil size={12} />
          </button> */}
          <button
            onClick={() => setSessionOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all border-indigo-500 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            <Calendar size={14} />
            {session}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${sessionOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sessionOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl overflow-hidden z-20 border border-slate-200 shadow-xl">
              {SESSIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSession(s);
                    setSessionOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    session === s
                      ? "text-indigo-600 bg-indigo-50 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "profile" && <ProfileTab s={student} />}
      {tab === "results" && (
        <ResultsTab
          studentId={student.id}
          grade={student.grade}
          session={session}
        />
      )}
      {tab === "attendance" && (
        <AttendanceTab studentId={student.id} session={session} />
      )}
      {tab === "courses" && <CoursesTab grade={student.grade} />}
    </div>
  );
}
