import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { Search, Plus } from "lucide-react";
import { useTeacherStore } from "../../../store/teacher.store";
import { AddTeacherModal } from "./AddTeacher";
import { Skeleton } from "../../../components/ui/Skeleton";

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const { teachers, loading, fetchTeachers } = useTeacherStore();

  useEffect(() => {
    fetchTeachers().catch(() => {});
  }, [fetchTeachers]);

  const departments = ["All", ...new Set(teachers.map((t) => t.dept))].filter(
    Boolean,
  );

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    const matchSearch =
      t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q);
    const matchDept = deptFilter === "All" || t.dept === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="flex flex-col space-y-5">
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Teachers</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {teachers.length} staff members
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={16} /> Create Teacher
        </button>
      </header>

      {/* Filters Option */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 shadow-sm">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email…"
            className="w-full pl-8 pr-4 py-2 rounded-lg text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "All" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {[
                "Teacher",
                "Department",
                "Classes",
                "Subjects",
                "Status",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && teachers.length === 0 ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No teachers found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${t.avatarColor}`}
                    >
                      <span className="text-white font-semibold text-xs">
                        {t.avatar}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-400">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {t.dept || "N/A"}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {t.classes.length > 0 ? (
                      t.classes.map((c) => (
                        <span
                          key={c}
                          className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                        >
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {t.subjects.length > 0 ? (
                      t.subjects.map((s) => (
                        <span
                          key={s}
                          className="px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      t.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={ROUTES.ADMIN.TEACHER_DETAIL(t.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors inline-block"
                  >
                    View Profile
                  </Link>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {showAdd && <AddTeacherModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}
