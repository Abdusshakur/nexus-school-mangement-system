import { BookOpen } from "lucide-react";
import { COURSE_TEACHERS } from "../data";
import { useSubjectStore } from "../../../../store/subject.store";
import type { AcademicSubject } from "../../../../api/academics";

// Courses  Tab component for displaying the list of courses a student is enrolled in, along with their respective teachers.

export function CoursesTab({ grade: _grade }: { grade: string }) {
  const { subjects } = useSubjectStore();

  return (
    <div className="space-y-3">
      {subjects.map((sub: AcademicSubject) => {
        const subject = sub.name;
        const teacher = COURSE_TEACHERS[subject] ?? {
          name: "TBA",
          email: "",
          colorClass: "text-slate-400",
          bgClass: "bg-slate-50",
        };
        return (
          <div
            key={subject}
            className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-200"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${teacher.bgClass}`}
            >
              <BookOpen size={18} className={teacher.colorClass} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{subject}</p>
              <p className="text-xs mt-0.5 text-slate-500">
                Taught by {teacher.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-[11px] ${teacher.colorClass.replace("text-", "bg-")}`}
              >
                {teacher.name.split(" ").slice(-1)[0][0]}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-slate-700">
                  {teacher.name}
                </p>
                <p className="text-xs text-slate-400">{teacher.email}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
