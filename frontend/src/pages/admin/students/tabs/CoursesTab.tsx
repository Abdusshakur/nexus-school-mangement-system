import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { getClassSubjects, type GroupSubject } from "../../../../api/academics";
import { Skeleton } from "../../../../components/ui/Skeleton";

export function CoursesTab({ grade: _grade, classId }: { grade: string; classId?: string }) {
  const [subjects, setSubjects] = useState<GroupSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    getClassSubjects(classId)
      .then((data) => {
        if (mounted) setSubjects(data.subjects);
      })
      .catch(() => {
        // Error handled globally via interceptor toast
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [classId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
        <BookOpen size={40} className="mb-3 opacity-40" />
        <p className="text-sm">No courses assigned to this class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {subjects.map((sub: GroupSubject) => {
        const subject = sub.subject_name;
        return (
          <div
            key={sub.subject_id}
            className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-200"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-indigo-50"
            >
              <BookOpen size={18} className="text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">{subject}</p>
              <p className="text-xs mt-0.5 text-slate-500">
                {sub.is_required ? "Core Subject" : "Elective Subject"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
