import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Search,
  Calendar
} from "lucide-react";
import { Spinner } from "../../../components/ui/Spinner";
import { fetchTeacherAttendanceHistory } from "../../../api/teacherAttendanceAdmin";
import type { TeacherAttendanceAdminItem } from "../../../api/teacherAttendanceAdmin";
import { useTeacherStore } from "../../../store/teacher.store";
import { toast } from "sonner";

export function AdminTeacherHistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const teacherIdParam = searchParams.get("teacherId") || "";

  const { teachers, fetchTeachers } = useTeacherStore();
  const [selectedTeacherId, setSelectedTeacherId] = useState(teacherIdParam);
  const [searchTerm, setSearchTerm] = useState("");

  const [history, setHistory] = useState<TeacherAttendanceAdminItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (!selectedTeacherId) {
      setHistory([]);
      return;
    }
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const data = await fetchTeacherAttendanceHistory(selectedTeacherId);
        setHistory(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load teacher history");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [selectedTeacherId]);

  // Removed handleTeacherChange as it is unused

  const formatTime = (isoString: string | null) => {
    if (!isoString) return "—";
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === "MISSED_CHECK_IN") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700"><AlertCircle size={12} /> Absent</span>;
    }
    if (status === "MISSED_CHECK_OUT") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle size={12} /> Missed Checkout</span>;
    }
    if (isLate || status === "LATE") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle size={12} /> Late</span>;
    }
    if (status === "CHECKED_IN" || status === "CHECKED_OUT") {
      return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={12} /> Present</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status.replace(/_/g, " ")}</span>;
  };

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen">
      <main className="p-8 max-w-7xl space-y-6">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/attendance/teacher-records")}
              className="p-2 hover:bg-slate-200 bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Teacher History</h1>
              <p className="text-sm text-slate-500 mt-1">View the complete attendance timeline for a teacher.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar: Teacher List */}
          <div className="w-full lg:w-1/3 xl:w-1/4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
                {filteredTeachers.map(t => (
                  <button
                    key={t.id}
                    className={`teacher-list-item w-full flex items-center justify-between p-3 rounded-xl text-left transition-colors group border ${selectedTeacherId === t.id
                      ? "bg-indigo-50 border-indigo-100"
                      : "border-transparent hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    data-name={t.name}
                    onClick={() => {
                      setSelectedTeacherId(t.id);
                      setSearchParams({ teacherId: t.id });
                    }}
                  >
                    <div>
                      <div className={`font-bold text-sm ${selectedTeacherId === t.id ? "text-indigo-700" : "text-slate-900 group-hover:text-slate-700"}`}>
                        {t.name}
                      </div>
                    </div>
                  </button>
                ))}
                {filteredTeachers.length === 0 && (
                  <div className="p-4 text-center text-sm text-slate-500">
                    No teachers match your search.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Main Content: Table */}
          <div className="w-full lg:w-2/3 xl:w-3/4">
            {selectedTeacherId ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold text-slate-900">Attendance Records</h2>
                    <p className="text-sm text-slate-500">Timeline for {teachers.find(t => t.id === selectedTeacherId)?.name}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {loadingHistory ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <Spinner className="w-6 h-6 text-indigo-600 mx-auto" />
                          </td>
                        </tr>
                      ) : history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                            No historical records found for this teacher.
                          </td>
                        </tr>
                      ) : (
                        history.map((record, index) => (
                          <tr key={record.id || `history-${index}`} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-slate-400" />
                                <span className="font-bold text-slate-900 text-sm">
                                  {formatDate(record.attendance_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                <Clock size={14} className={record.check_in_at ? "text-slate-400" : "text-slate-200"} />
                                {formatTime(record.check_in_at)}
                              </div>
                              {record.check_in_method && (
                                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                  {record.check_in_method}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                                <Clock size={14} className={record.check_out_at ? "text-slate-400" : "text-slate-200"} />
                                {formatTime(record.check_out_at)}
                              </div>
                              {record.check_out_method && (
                                <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                                  {record.check_out_method}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(record.status, record.is_late)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                              {record.notes || "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed p-12 text-center flex flex-col items-center justify-center h-[600px]">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <Search size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Select a Teacher</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Select a teacher from the list on the left to view their complete attendance history timeline.
                </p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
