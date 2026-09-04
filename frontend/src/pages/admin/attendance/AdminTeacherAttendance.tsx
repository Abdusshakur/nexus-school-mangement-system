import { useState, useEffect } from "react";
import { 
  Search, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { TeacherQRScanner } from "../../../components/attendance/TeacherQRScanner";
import { useTeacherAttendanceAdminStore } from "../../../store/teacherAttendanceAdmin.store";
import { TeacherAttendanceCorrectionModal } from "./components/TeacherAttendanceCorrectionModal";
import type { TeacherAttendanceAdminItem } from "../../../api/teacherAttendanceAdmin";
import { Spinner } from "../../../components/ui/Spinner";

export function AdminTeacherAttendance() {
  const { records, loading, loadRecords, processMissed } = useTeacherAttendanceAdminStore();
  const [processingMissed, setProcessingMissed] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  
  const [dateFilter, setDateFilter] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedRecord, setSelectedRecord] = useState<TeacherAttendanceAdminItem | null>(null);

  useEffect(() => {
    loadRecords(dateFilter, undefined, statusFilter || undefined);
  }, [dateFilter, statusFilter, loadRecords]);

  const handleProcessMissed = async () => {
    setShowProcessModal(false);
    setProcessingMissed(true);
    try {
      await processMissed(dateFilter);
    } finally {
      setProcessingMissed(false);
    }
  };

  const filteredRecords = records.filter(record => 
    record.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === "MISSED_CHECK_IN" || status === "MISSED_CHECK_OUT") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle size={12} /> Absent</span>;
    }
    if (isLate || status === "LATE") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle size={12} /> Late</span>;
    }
    if (status === "CHECKED_IN" || status === "CHECKED_OUT") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Present</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
  };

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen">
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Teacher Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor and manage daily staff attendance records.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowProcessModal(true)}
              disabled={processingMissed}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {processingMissed ? <Spinner className="w-4 h-4" /> : <AlertCircle size={16} />}
              Process Absentees
            </button>
          </div>
        </div>

        {/* QR Scanner Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="p-6">
            <TeacherQRScanner isAdmin={true} />
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          {/* Filters */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 rounded-t-2xl">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-700"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white font-medium text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="NOT_STARTED">Not Started</option>
                <option value="CHECKED_IN">Checked In</option>
                <option value="CHECKED_OUT">Checked Out</option>
                <option value="MISSED_CHECK_IN">Missed Check-In (Absent)</option>
                <option value="MISSED_CHECK_OUT">Missed Check-Out</option>
                <option value="MANUAL_REVIEW">Manual Review</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Spinner className="w-6 h-6 text-indigo-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No attendance records found for this date.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record.teacher_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {record.teacher_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <Clock size={14} className={record.check_in_at ? "text-slate-400" : "text-slate-200"} />
                          {formatTime(record.check_in_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          <Clock size={14} className={record.check_out_at ? "text-slate-400" : "text-slate-200"} />
                          {formatTime(record.check_out_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(record.status, record.is_late)}
                          {record.check_in_method && (
                            <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm tracking-wider">
                              {record.check_in_method}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(record)}
                          className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Manual Correction
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal */}
        {selectedRecord && (
          <TeacherAttendanceCorrectionModal
            teacherRecord={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}

        {/* Process Absentees Modal */}
        {showProcessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  Process Absentees?
                </h2>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Are you sure you want to process missed attendance for <span className="font-bold text-slate-700">{dateFilter}</span>? Teachers without a check-in will be permanently marked as absent.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowProcessModal(false)}
                    className="px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessMissed}
                    className="px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
                  >
                    Process Absentees
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
