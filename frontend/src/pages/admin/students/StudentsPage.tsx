import { ROUTES } from "../../../config/routes";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { allStudents } from "./data";

export function StudentList() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const grades = [
    "All",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];

  const filtered = allStudents.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === "All" || s.grade === gradeFilter;
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Students</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {allStudents.length} enrolled students
          </p>
        </div>
        <Link
          to={ROUTES.ADMIN.STUDENT_ADD}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors"
        >
          <Plus size={16} /> Add Student
        </Link>
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
            placeholder="Search by name or ID…"
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
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Student
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Grade
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                Email
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                Parent
              </th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-xs ${s.avatarBg}`}
                    >
                      <span>{s.avatar}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {s.name}
                      </p>
                      <p className="text-xs text-slate-400">{s.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-700">
                  {s.grade}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 hidden md:table-cell">
                  {s.email}
                </td>
                <td className="px-5 py-3.5 text-sm text-slate-500 hidden lg:table-cell">
                  {s.parentName}
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      s.status === "Active"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {s.status === "Active" ? (
                      <CheckCircle size={10} />
                    ) : (
                      <XCircle size={10} />
                    )}
                    {s.status}
                  </span>
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
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No students match your search.
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentsPage() {
  return <StudentList />;
}
