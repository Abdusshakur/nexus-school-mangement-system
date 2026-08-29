import { useState } from "react";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { getGradeLetter } from "../../teacher/grades/ReportCardsTab";

const APPROVED_CLASSES = [
  {
    id: "sub_2",
    classId: "JSS1A",
    className: "JSS 1 A",
    term: "3rd Term",
    session: "2025/2026",
    studentCount: 5,

    status: "PENDING_PROMOTION",
    students: [
      { id: "S007", name: "Layla Hassan", average: 79.8 },
      { id: "S009", name: "Femi Adeyemi", average: 45.4 },
      { id: "S010", name: "Chidi Okafor", average: 58.6 },
    ],
  },
];

export function PromotionsTab() {
  const [classes, setClasses] = useState(APPROVED_CLASSES);
  const [isPromoting, setIsPromoting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>("sub_2");

  // Track selected students per class: Record<classId, Set<studentId>>
  const [selectedStudents, setSelectedStudents] = useState<
    Record<string, Set<string>>
  >({
    sub_2: new Set(
      APPROVED_CLASSES[0].students
        .filter((s) => s.average >= 50)
        .map((s) => s.id),
    ), // Pre-select passing students
  });

  const toggleStudent = (classId: string, studentId: string) => {
    setSelectedStudents((prev) => {
      const classSet = new Set(prev[classId] || []);
      if (classSet.has(studentId)) classSet.delete(studentId);
      else classSet.add(studentId);
      return { ...prev, [classId]: classSet };
    });
  };

  const toggleAll = (classId: string, studentIds: string[]) => {
    setSelectedStudents((prev) => {
      const classSet = prev[classId] || new Set();
      if (classSet.size === studentIds.length) {
        return { ...prev, [classId]: new Set() }; // Deselect all
      }
      return { ...prev, [classId]: new Set(studentIds) }; // Select all
    });
  };

  const handlePromote = (classId: string, className: string) => {
    const selectedCount = selectedStudents[classId]?.size || 0;
    if (selectedCount === 0)
      return toast.error("No students selected for promotion.");

    setIsPromoting(classId);
    setTimeout(() => {
      setClasses((prev) =>
        prev.map((c) => (c.id === classId ? { ...c, status: "PROMOTED" } : c)),
      );
      setIsPromoting(null);
      setExpandedId(null);
      toast.success(
        `Success! ${selectedCount} students in ${className} have been promoted. Unselected students are retained.`,
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <GraduationCap size={20} className="text-indigo-600 shrink-0" />
        <p className="text-sm font-medium text-indigo-900">
          End-of-Session Promotions. Only classes with fully{" "}
          <strong>APPROVED</strong> report cards will appear here for promotion.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900">Ready for Promotion</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search class..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <button className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100">
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {classes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No classes are currently ready for promotion.
            </div>
          ) : (
            classes.map((cls) => {
              const isExpanded = expandedId === cls.id;
              const selectedCount = selectedStudents[cls.id]?.size || 0;
              const allSelected = selectedCount === cls.students.length;

              return (
                <div
                  key={cls.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <div
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : cls.id)}
                  >
                    <div className="flex items-center gap-4">
                      <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                        {isExpanded ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                      </button>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {cls.className}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {cls.studentCount} Students
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {cls.status === "PENDING_PROMOTION" ? (
                        <button
                          onClick={() => handlePromote(cls.id, cls.className)}
                          disabled={
                            isPromoting === cls.id || selectedCount === 0
                          }
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
                        >
                          {isPromoting === cls.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <ArrowRightLeft size={16} />
                              Promote Selected ({selectedCount})
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-5 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                          <CheckCircle size={16} /> PROMOTED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Student List */}
                  {isExpanded && (
                    <div className="px-14 pb-5 pt-2 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Review Academic Records
                        </h5>
                        {cls.status === "PENDING_PROMOTION" && (
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() =>
                                toggleAll(
                                  cls.id,
                                  cls.students.map((s) => s.id),
                                )
                              }
                              className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            Select All
                          </label>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {cls.students.map((student) => {
                          const gs = getGradeLetter(student.average);
                          const isSelected = selectedStudents[cls.id]?.has(
                            student.id,
                          );
                          const isFailing = student.average < 50;

                          return (
                            <div
                              key={student.id}
                              className={`flex items-center gap-3 p-3 bg-white border rounded-lg transition-colors ${
                                isSelected
                                  ? "border-indigo-500 ring-1 ring-indigo-500"
                                  : "border-slate-200"
                              }`}
                            >
                              {cls.status === "PENDING_PROMOTION" && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() =>
                                    toggleStudent(cls.id, student.id)
                                  }
                                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-900">
                                  {student.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`text-xs font-bold ${isFailing ? "text-red-600" : "text-slate-500"}`}
                                  >
                                    Avg: {student.average}%
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${gs.bg} ${gs.color}`}
                                  >
                                    {gs.l}
                                  </span>
                                </div>
                              </div>
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                <Eye size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
