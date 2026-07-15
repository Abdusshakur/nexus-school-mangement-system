import { ROUTES } from "../../../config/routes";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, GraduationCap } from "lucide-react";
import { teachersList } from "./data";

export function TeacherDetailPage() {
  const { id } = useParams();
  const t =
    teachersList.find((teacher) => teacher.id === id) || teachersList[0];

  return (
    <div className="flex-1 flex flex-col bg-slate-50 ">
      <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-10 flex items-center gap-4">
        <Link
          to={ROUTES.ADMIN.TEACHERS}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-extrabold tracking-tight">
            {t.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Faculty ID: {t.id} · Westwood Campus
          </p>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center h-fit">
          <div
            className={`w-24 h-24 rounded-2xl ${t.avatarColor} flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-3xl shadow-md`}
          >
            {t.avatar}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{t.name}</h2>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
            {t.title}
          </p>
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-bold text-xs mt-3">
            {t.dept}
          </span>

          <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-4">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Work Email
              </span>
              <p className="text-slate-700 text-sm font-semibold flex items-center gap-2 mt-0.5">
                <Mail size={14} className="text-slate-400" /> {t.email}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Direct Line
              </span>
              <p className="text-slate-700 text-sm font-semibold flex items-center gap-2 mt-0.5">
                <Phone size={14} className="text-slate-400" /> {t.phone}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                Office Location
              </span>
              <p className="text-slate-700 text-sm font-semibold flex items-center gap-2 mt-0.5">
                <MapPin size={14} className="text-slate-400" /> Room 402,
                Science Annex
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-lg mb-4">
              Faculty Biography
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Dr. Eleanor Kim is a senior instructor at Westwood Academy,
              specializing in core scientific principles, thermodynamics, and
              advanced software engineering pipelines. Dr. Kim has published
              multiple papers on computational physics models and is committed
              to fostering innovative thinking.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-300">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Active Subjects & Classrooms
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Assigned rosters for current academic session
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                {
                  name: "Advanced Mathematics III",
                  schedule: "Mon, Wed 09:00 AM - 10:30 AM",
                  students: "28 Enrolled",
                },
                {
                  name: "Physics & Thermodynamics",
                  schedule: "Tue, Thu 11:00 AM - 12:30 PM",
                  students: "32 Enrolled",
                },
                {
                  name: "Computer Programming II",
                  schedule: "Mon, Wed, Fri 02:00 PM - 03:30 PM",
                  students: "22 Enrolled",
                },
              ].map((subject, idx) => (
                <div
                  key={idx}
                  className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-800 text-sm">
                        {subject.name}
                      </p>
                      <p className="text-slate-400 text-xs font-semibold mt-1">
                        {subject.schedule}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    {subject.students}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
