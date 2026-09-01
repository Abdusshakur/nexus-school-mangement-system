import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, UserCheck, Trash2, X } from "lucide-react";
import { useClassStore } from "../../../store/class.store";
import { useTeacherStore } from "../../../store/teacher.store";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Spinner } from "../../../components/ui/Spinner";

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full overflow-y-auto shadow-2xl max-w-md max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 sticky top-0 bg-white z-10 border-b border-slate-100">
          <h2 className="font-bold text-[17px] text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export function TeacherAssignment() {
  const {
    classes,
    loading: classesLoading,
    assignClassTeacher,
    removeClassTeacher,
    loadClasses,
  } = useClassStore();
  const { teachers, loading: teachersLoading, fetchTeachers } = useTeacherStore();

  const loading = classesLoading || teachersLoading;

  useEffect(() => {
    fetchTeachers().catch(() => { });
    loadClasses().catch(() => { });
  }, [fetchTeachers, loadClasses]);

  const [assignModal, setAssignModal] = useState<{
    classId: string;
    replace: boolean;
  } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const activeTeachers = teachers.filter((t) => t.status === "Active");

  const handleAssign = async () => {
    if (!assignModal || !selectedTeacher) return;
    setConfirming(true);
    try {
      await assignClassTeacher(assignModal.classId, selectedTeacher);
      setAssignModal(null);
      setSelectedTeacher("");
      const cls = classes.find((c) => c.id === assignModal.classId);
      const teacher = teachers.find((t) => t.id === selectedTeacher);
      setSuccessMsg(
        `${teacher?.name} assigned as Class Teacher for ${cls?.name}.`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirming(false);
    }
  };

  const handleRemove = async (classId: string) => {
    try {
      setRemoving(true);
      await removeClassTeacher(classId);
      setConfirmRemove(null);
      const cls = classes.find((c) => c.id === classId);
      setSuccessMsg(`Class teacher removed from ${cls?.name}.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setRemoving(false);
    }
  };

  const assigned = classes.filter((c) => c.form_teacher_id);
  const unassigned = classes.filter((c) => !c.form_teacher_id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">
            Teacher Assignment
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            {assigned.length} of {classes.length} classes have an assigned class
            teacher
          </p>
        </div>
        <button
          onClick={() => {
            setAssignModal({ classId: "", replace: false });
            setSelectedTeacher("");
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
        >
          <UserCheck size={15} /> Assign Teacher
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-100 border border-emerald-300">
          <CheckCircle size={18} className="text-emerald-500" />
          <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
        </div>
      )}

      {unassigned.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
          <AlertTriangle size={14} className="text-amber-800 mt-0.5" />
          <p className="text-sm text-amber-800">
            {unassigned.length} class{unassigned.length !== 1 ? "es" : ""}{" "}
            without a class teacher: {unassigned.map((c) => c.name).join(", ")}.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-slate-50">
              {["Class", "Current Class Teacher", "Status", "Actions"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {loading && classes.length === 0 ? (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-5 py-4"><Skeleton className="h-5 w-20" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-5 py-4 text-right"><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></td>
                  </tr>
                ))}
              </>
            ) : classes.map((cls) => {
              const tid = cls.form_teacher_id;
              const teacher = tid ? teachers.find((t) => t.id === tid) : null;
              return (
                <tr
                  key={cls.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <h3 className="font-bold text-slate-900 text-[15px]">
                      {cls.name}
                    </h3>
                  </td>
                  <td className="px-5 py-3.5">
                    {teacher ? (
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${teacher.avatarColor}`}
                        >
                          <span className="text-white font-bold text-[10px]">
                            {teacher.avatar}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {teacher.dept}
                          </p>
                        </div>
                      </div>
                    ) : cls.form_teacher_name ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-indigo-500">
                          <span className="text-white font-bold text-[10px]">
                            {cls.form_teacher_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {cls.form_teacher_name}
                          </p>
                          <p className="text-xs text-slate-400">
                            Teacher
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${tid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
                    >
                      {tid ? "Assigned" : "Unassigned"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setAssignModal({ classId: cls.id, replace: !!tid });
                          setSelectedTeacher(tid ?? "");
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${tid ? "bg-indigo-50 text-indigo-500 hover:bg-indigo-100" : "bg-teal-50 text-teal-600 hover:bg-teal-100"}`}
                      >
                        {tid ? "Replace" : "Assign"}
                      </button>
                      {tid && (
                        <button
                          onClick={() => setConfirmRemove(cls.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Assign modal */}
      {assignModal !== null && (
        <Modal
          title={
            assignModal.replace
              ? "Replace Class Teacher"
              : "Assign Class Teacher"
          }
          onClose={() => setAssignModal(null)}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">
                Class
              </label>
              <select
                value={assignModal.classId}
                onChange={(e) =>
                  setAssignModal((m) =>
                    m ? { ...m, classId: e.target.value } : m,
                  )
                }
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value=""> Select Class </option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700">
                Teacher
              </label>
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm bg-white border border-slate-200 outline-none focus:border-indigo-500 transition-colors"
              >
                <option value=""> Select Teacher </option>
                {activeTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} - {t.dept}
                  </option>
                ))}
              </select>
            </div>
            {assignModal.replace && assignModal.classId && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50">
                <AlertTriangle size={13} className="text-amber-800 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This will replace the current class teacher for{" "}
                  {classes.find((c) => c.id === assignModal.classId)?.name}.
                </p>
              </div>
            )}
            {(() => {
              const alreadyAssignedClassId = classes.find(
                (c) => c.form_teacher_id === selectedTeacher && c.id !== assignModal?.classId
              )?.id;

              if (alreadyAssignedClassId) {
                const alreadyAssignedClassName = classes.find((c) => c.id === alreadyAssignedClassId)?.name;
                return (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50">
                    <AlertTriangle size={13} className="text-amber-800 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800">
                      This teacher is already assigned to <strong>{alreadyAssignedClassName}</strong>. Assigning them here will remove them from that class.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
              <button
                type="button"
                onClick={handleAssign}
                disabled={
                  !assignModal.classId || !selectedTeacher || confirming
                }
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full sm:w-auto"
              >
                {confirming ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <UserCheck size={14} />
                )}
                {confirming ? "Assigning..." : "Confirm Assignment"}
              </button>
              <button
                onClick={() => setAssignModal(null)}
                className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Remove confirmation */}
      {confirmRemove && (
        <Modal
          title="Remove Class Teacher"
          onClose={() => setConfirmRemove(null)}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Remove class teacher from{" "}
              <strong className="text-slate-900">
                {classes.find((c) => c.id === confirmRemove)?.name}
              </strong>
              ? The class will be unassigned and the teacher will no longer be
              able to mark attendance for it.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={() => handleRemove(confirmRemove)}
                disabled={removing}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {removing ? <Spinner size="sm" className="text-white" /> : <Trash2 size={14} />}
                {removing ? "Removing..." : "Remove Assignment"}
              </button>
              <button
                onClick={() => setConfirmRemove(null)}
                className="px-4 py-2.5 rounded-lg text-sm border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
