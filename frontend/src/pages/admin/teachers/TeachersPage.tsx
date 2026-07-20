import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import {
  Search,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  BookOpen,
  Plus,
} from "lucide-react";
import { Input } from "../../../components/dashboard/Input";
import { useTeacherStore } from "../../../store/teacher.store";
import { AddTeacherWizard } from "./AddTeacher";

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const { teachers } = useTeacherStore();

  const filtered = teachers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.dept.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === "All" ? true : t.dept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="flex flex-col ">
      <header className=" flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 text-2xl font-bold ">Teachers</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {teachers.length} teaching staffs
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} /> Add Teacher
        </button>
      </header>

      <main className="flex-1 py-4 space-y-6 max-w-full w-full ">
        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search teachers by name or title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-4 py-3.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-11"
            >
              <option value="All">All Departments</option>
              {["Science & Engineering", "Arts & Languages", "Mathematics"].map(
                (d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex gap-5"
            >
              <div
                className={`w-16 h-16 rounded-2xl ${t.avatarColor} flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm`}
              >
                {t.avatar}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {t.name}
                      </h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                        {t.title}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                      {t.dept}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Mail size={13} /> <span>{t.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                      <Phone size={13} /> <span>{t.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <BookOpen size={13} /> {t.classrooms} Classrooms
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {t.experience} Experience
                    </span>
                  </div>
                  <Link
                    to={ROUTES.ADMIN.TEACHER_DETAIL(t.id)}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-0.5"
                  >
                    Details <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      {showAdd && <AddTeacherWizard onClose={() => setShowAdd(false)} />}
    </div>
  );
}
