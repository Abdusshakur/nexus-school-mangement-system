import { ROUTES } from "../../../config/routes";
import { useEffect, useState } from "react";
import { useClassStore } from "../../../store/class.store";
import { Link } from "react-router-dom";
import { Search, Plus, ChevronRight, CheckCircle, } from "lucide-react";
import {
  fetchStudentsList,
  formatClassName,
  type StudentResponse,
} from "../../../api/students";
import { Skeleton } from "../../../components/ui/Skeleton";

export function StudentList() {
  const { classes, loadClasses } = useClassStore();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [students, setStudents] = useState<StudentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const grades = ["All", ...classes.map((c) => c.name)];

  useEffect(() => {
    loadClasses().catch(() => { });
  }, [loadClasses]);

  useEffect(() => {
    let isMounted = true;
    const loadStudents = async () => {
      setLoading(true);
      try {
        const classParam = gradeFilter !== "All" ? gradeFilter : undefined;

        // If there's no search string, just fetch everything for the class
        if (!search) {
          const data = await fetchStudentsList(undefined, classParam, undefined);
          if (isMounted) setStudents(data);
          return;
        }

        // If there is a search string, we must search BOTH fields independently

        const [byAdm, byName] = await Promise.all([
          fetchStudentsList(search, classParam, undefined),
          fetchStudentsList(undefined, classParam, search),
        ]);

        if (isMounted) {
          const map = new Map();
          [...byAdm, ...byName].forEach((s) => map.set(s.id, s));
          setStudents(Array.from(map.values()));
        }
      } catch (err: unknown) {
        console.error("Failed to load students:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const timer = setTimeout(loadStudents, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [search, gradeFilter]);

  const filtered = students.filter((student) => {
    if (statusFilter === "Active") return !!student.class_name;
    if (statusFilter === "Inactive") return !student.class_name;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {students.length} enrolled students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={ROUTES.ADMIN.STUDENT_ADD}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Student
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or admission number…"
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
          />
        </div>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
        >
          {grades.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white"
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto w-full">
        {loading ? (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3"><Skeleton className="h-4 w-24" /></th>
                <th className="text-left px-5 py-3"><Skeleton className="h-4 w-16" /></th>
                <th className="text-left px-5 py-3 hidden md:table-cell"><Skeleton className="h-4 w-16" /></th>
                <th className="text-left px-5 py-3 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></th>
                <th className="text-right px-5 py-3"><Skeleton className="h-4 w-12 ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-4 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Student
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Class
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Email
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const initials = (
                  (s.first_name[0] || "") + (s.last_name[0] || "")
                ).toUpperCase();

                const colors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500"];
                const colorIndex = s.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
                const avatarColor = colors[colorIndex];

                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-xs ${avatarColor}`}>
                          <span>{initials}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {s.first_name} {s.last_name}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {s.admission_number}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700">
                      {formatClassName(s.class_name)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                      {s.email}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.class_name ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-slate-400" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        to={ROUTES.ADMIN.STUDENT_DETAIL(s.id)}
                        className="flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                      >
                        View <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        </div>
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No students records found.
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentsPage() {
  return <StudentList />;
}
