import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { CLASSES_DATA } from "./data";
import {
  Users,
  Clock,
  ArrowRight,
  BarChart3,
  CalendarCheck,
} from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useAuthStore } from "../../../store/auth/authStore";
import { useTeacherStore } from "../../../store/teacher.store";
import { useEffect } from "react";

export default function TeacherClasses() {
  const { classTeacherAssignments } = useClassStore();
  const { user } = useAuthStore();
  const { teachers, fetchTeachers } = useTeacherStore();

  useEffect(() => {
    fetchTeachers().catch(() => {});
  }, [fetchTeachers]);

  const myTeacherProfileId = teachers.find(t => t.user_id === user?.id)?.id;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Classes</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of your assigned classes for this term.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {CLASSES_DATA.map((cls) => (
          <div
            key={cls.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider uppercase mb-3">
                  {cls.code}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                  {cls.name}
                </h3>
                <p className="text-slate-500 text-xs flex items-center gap-1.5 mt-2">
                  <Clock size={14} /> {cls.nextClass}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4 mt-auto">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <Users size={12} /> Students
                  </p>
                  <p className="font-bold text-slate-800">{cls.count}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                    <BarChart3 size={12} /> Avg Grade
                  </p>
                  <p className="font-bold text-slate-800">
                    {cls.gradeAverage.split(" ")[0]}
                  </p>
                </div>
              </div>

              {/* Attendance Bar */}
              {classTeacherAssignments[cls.id] === myTeacherProfileId && (
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-1.5">
                    <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <CalendarCheck size={12} /> Attendance
                    </p>
                    <span className="text-xs font-bold text-slate-700">
                      {cls.attendanceRate}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${cls.color}`}
                      style={{ width: cls.attendanceRate }}
                    />
                  </div>
                </div>
              )}

              <Link
                to={ROUTES.TEACHER.CLASS_DETAIL(cls.id)}
                className="mt-auto w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
              >
                Class Details <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
