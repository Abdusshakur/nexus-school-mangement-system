import { useEffect, useState } from "react";
import { History, Calendar, Layout } from "lucide-react";
import { getStudentEnrollments, type StudentEnrollmentHistoryResponse } from "../../../../api/students";

export function EnrollmentsTab({ studentId }: { studentId: string }) {
  const [enrollments, setEnrollments] = useState<StudentEnrollmentHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getStudentEnrollments(studentId)
      .then((data) => {
        if (mounted) setEnrollments(data);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load enrollment history.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-slate-400">
        <p className="animate-pulse text-sm">Loading enrollment history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center">
        {error}
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 bg-white rounded-xl border border-slate-200">
        <History size={40} className="mb-3 opacity-40" />
        <p className="text-sm">No enrollment history found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Enrollment History</h3>
          <p className="text-xs text-slate-500 mt-0.5">Historical record of all class assignments</p>
        </div>
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <History size={18} />
        </div>
      </div>

      <div className="p-5">
        <div className="relative border-l-2 border-indigo-100 ml-3 md:ml-4 space-y-8 pb-4">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="relative pl-6 md:pl-8">

              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${enrollment.status === "ACTIVE" ? "bg-indigo-500" : "bg-slate-300"
                  }`}
              />


              <div className={`p-4 rounded-xl border transition-colors ${enrollment.status === "ACTIVE"
                ? "bg-indigo-50/50 border-indigo-100"
                : "bg-slate-50 border-slate-100"
                }`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-lg">
                        {enrollment.class_name}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${enrollment.status === "ACTIVE"
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-200 text-slate-600"
                        }`}>
                        {enrollment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      Enrolled on {new Date(enrollment.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm font-medium text-slate-700 bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      {enrollment.session_name}
                    </div>
                    <div className="w-px h-4 bg-slate-200" />
                    <div className="flex items-center gap-1.5">
                      <Layout size={14} className="text-slate-400" />
                      {enrollment.term_name}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
