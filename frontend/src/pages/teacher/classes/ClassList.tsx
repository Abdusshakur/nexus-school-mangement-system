import { Clock, MapPin, Users } from "lucide-react";
import type { Classroom } from "./data";
import { CLASSES_DATA } from "./data";

interface Props {
  activeClass: Classroom;
  onSelectClass: (cls: Classroom) => void;
}

export function ClassList({ activeClass, onSelectClass }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-extrabold text-slate-900 text-lg mb-2">
        My Classrooms
      </h3>
      {CLASSES_DATA.map((cls) => (
        <div
          key={cls.id}
          onClick={() => onSelectClass(cls)}
          className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all hover:shadow-md ${
            activeClass.id === cls.id
              ? "border-indigo-500 ring-2 ring-indigo-500/10"
              : "border-slate-200"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {cls.code}
            </span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {cls.gradeAverage}
            </span>
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm mt-2">
            {cls.name}
          </h4>

          <div className="mt-4 space-y-2 text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              <span>{cls.schedule}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400" />
              <span>{cls.room}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={13} className="text-slate-400" />
              <span>{cls.count} Assigned Students</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
