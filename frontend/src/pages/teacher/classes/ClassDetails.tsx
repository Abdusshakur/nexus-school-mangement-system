import { Clock, MapPin, CheckCircle } from "lucide-react";
import type { Classroom } from "./data";
import { STUDENTS_ROSTERS } from "./data";

interface Props {
  activeClass: Classroom;
}

export function ClassDetails({ activeClass }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {activeClass.code}
            </span>
            <h3 className="font-extrabold text-slate-900 text-xl mt-2.5">
              {activeClass.name}
            </h3>
            <p className="text-slate-400 text-xs font-semibold mt-1 flex items-center gap-1.5">
              <MapPin size={13} /> {activeClass.room} · <Clock size={13} />{" "}
              {activeClass.schedule}
            </p>
          </div>
          <div className="text-left bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              Class Average
            </p>
            <p className="text-indigo-600 text-lg font-extrabold mt-0.5">
              {activeClass.gradeAverage}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Syllabus Milestones */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="font-extrabold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-2">
            Curriculum Syllabus
          </h4>
          <ul className="space-y-3.5">
            {activeClass.syllabus.map((item, idx) => (
              <li key={idx} className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5 text-indigo-600">
                  <CheckCircle size={13} />
                </div>
                <span className="text-slate-600 text-xs font-medium leading-relaxed">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Student Roster */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h4 className="font-extrabold text-slate-900 text-sm mb-4 border-b border-slate-100 pb-2">
            Student Roster ({activeClass.count} total)
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {(STUDENTS_ROSTERS[activeClass.id] || []).map((student, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                    {student
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-slate-800 text-xs font-bold">
                    {student}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">
                  ENROLLED
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
