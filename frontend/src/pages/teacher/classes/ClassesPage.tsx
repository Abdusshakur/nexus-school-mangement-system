import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { Users, Clock, ArrowRight, BookOpen } from "lucide-react";
import { useTeacherContextStore } from "../../../store/teacherContext.store";
import { useEffect, useMemo } from "react";

export default function TeacherClasses() {
  const { myAssignments, myStudents, fetchAllContext } = useTeacherContextStore();

  useEffect(() => {
    fetchAllContext();
  }, [fetchAllContext]);

  // Group students by class_id to get accurate student counts per class
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    myStudents.forEach((student) => {
      counts[student.class_id] = (counts[student.class_id] || 0) + 1;
    });
    return counts;
  }, [myStudents]);

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">My Assignments</h1>
        <p className="text-slate-500 text-sm mt-1">
          Overview of your assigned subjects and classes for this term.
        </p>
      </div>

      {myAssignments.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Assignments Yet</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">
            You have not been assigned to teach any subjects for the current active term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {myAssignments.map((assignment) => (
            <div
              key={assignment.assignment_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-bold tracking-wider uppercase mb-3">
                    {assignment.status}
                  </span>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                    {assignment.subject_name}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium mt-2">
                    {assignment.class_name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-4 mt-auto">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Users size={12} /> Enrolled
                    </p>
                    <p className="font-bold text-slate-800">
                      {classStudentCounts[assignment.class_id] || 0} Students
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <Clock size={12} /> Schedule
                    </p>
                    <p className="font-bold text-slate-800">Check Timetable</p>
                  </div>
                </div>

                <Link
                  to={ROUTES.TEACHER.CLASS_DETAIL(assignment.class_id)}
                  className="mt-auto w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
                >
                  View Roster <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
