import { useState } from "react";
import { X } from "lucide-react";
import { Spinner } from "../../../../components/ui/Spinner";
import { useTeacherAttendanceAdminStore } from "../../../../store/teacherAttendanceAdmin.store";
import type { TeacherAttendanceAdminItem } from "../../../../api/teacherAttendanceAdmin";
import { toast } from "sonner";

interface TeacherAttendanceCorrectionModalProps {
  teacherRecord: TeacherAttendanceAdminItem;
  onClose: () => void;
}

export function TeacherAttendanceCorrectionModal({ teacherRecord, onClose }: TeacherAttendanceCorrectionModalProps) {
  const { applyCorrection } = useTeacherAttendanceAdminStore();
  const [loading, setLoading] = useState(false);
  
  const [action, setAction] = useState<"CHECK_IN" | "CHECK_OUT">("CHECK_IN");
  const [time, setTime] = useState(() => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) {
      toast.error("Please provide a time.");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a reason for the manual correction.");
      return;
    }

    setLoading(true);
    
    // Construct ISO string using the record's date and the selected time
    const [hours, minutes] = time.split(":");
    const timestampDate = new Date(`${teacherRecord.attendance_date}T00:00:00`);
    timestampDate.setHours(parseInt(hours, 10));
    timestampDate.setMinutes(parseInt(minutes, 10));

    try {
      await applyCorrection(teacherRecord.id, {
        action,
        timestamp: timestampDate.toISOString(),
        reason: reason.trim()
      });
      onClose();
    } catch (err) {
      // Error is handled in store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Manual Attendance Entry
            </h2>
            <p className="text-sm text-slate-500">
              Correcting record for {teacherRecord.teacher_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="correction-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAction("CHECK_IN")}
                  className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                    action === "CHECK_IN" 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Manual Check-In
                </button>
                <button
                  type="button"
                  onClick={() => setAction("CHECK_OUT")}
                  className={`py-2 px-4 rounded-xl border text-sm font-semibold transition-colors ${
                    action === "CHECK_OUT" 
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  Manual Check-Out
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Time (for {new Date(teacherRecord.attendance_date).toLocaleDateString()})
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                Reason / Notes
              </label>
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Teacher's phone battery died, verified arrival at gate."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white resize-none"
              ></textarea>
              <p className="text-xs text-slate-400 mt-1">This will be logged in the audit trail.</p>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="correction-form"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? <Spinner className="w-4 h-4" /> : "Save Correction"}
          </button>
        </div>
      </div>
    </div>
  );
}
