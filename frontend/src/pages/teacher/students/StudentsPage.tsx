import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, ChevronRight, User as UserIcon } from "lucide-react";
import { useTeacherContextStore } from "../../../store/teacherContext.store";
import { useClassStore } from "../../../store/class.store";
import { ROUTES } from "../../../config/routes";

export default function TeacherStudents() {
  const { myStudents, myAssignments, myProfile, fetchAllContext, loading } = useTeacherContextStore();
  const { classes, loadClasses } = useClassStore();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");

  useEffect(() => {
    fetchAllContext();
    loadClasses();
  }, [fetchAllContext, loadClasses]);

  // Unique classes the teacher is assigned to for the filter dropdown
  const uniqueClasses = Array.from(
    new Set(myAssignments.map((a) => a.class_name))
  ).sort();

  const filteredStudents = myStudents.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(search.toLowerCase()) ||
      student.last_name.toLowerCase().includes(search.toLowerCase()) ||
      student.admission_number.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === "All" || student.class_name === classFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            You have {myStudents.length} students across your assigned classes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or admission number..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white min-w-[140px]"
          >
            <option value="All">All Classes</option>
            {uniqueClasses.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4">
            <UserIcon className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No students found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              {myStudents.length === 0
                ? "You don't have any students assigned to you yet."
                : "No students match your current search and filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Admission No.</th>
                  <th className="px-6 py-4">Gender</th>
                  <th className="px-6 py-4">Class</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const initials = (student.first_name[0] + student.last_name[0]).toUpperCase();
                  const studentClass = classes.find((c) => c.id === student.class_id);
                  const isClassTeacher = studentClass?.form_teacher_id === myProfile?.id;
                  
                  return (
                    <tr key={student.student_id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {student.first_name} {student.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                          {student.admission_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600 capitalize">
                          {student.gender.toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          {student.class_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={ROUTES.TEACHER.STUDENT_DETAIL(student.student_id)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {isClassTeacher ? "View Profile" : "View Subject Grades"} <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
