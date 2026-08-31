import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Users,
  Pencil,
  X,
} from "lucide-react";
import { SESSIONS, type Student } from "./data";
import {
  fetchStudentById,
  fetchStudentsList,
  formatClassName,
  updateStudentProfile,
} from "../../../api/students";
import { ProfileTab } from "./tabs/ProfileTab";
import { ResultsTab } from "./tabs/ResultsTab";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { CoursesTab } from "./tabs/CoursesTab";
import { EnrollmentsTab } from "./tabs/EnrollmentsTab";
import { TransferStudentModal } from "./TransferStudentModal";
import { toast } from "sonner";
import { useAuthStore } from "../../../store/auth";
import { UserRole } from "../../../types/roles";
import { useTeacherContextStore } from "../../../store/teacherContext.store";
import { useClassStore } from "../../../store/class.store";

type ProfileTab =
  | "profile"
  | "results"
  | "attendance"
  | "courses"
  | "enrollments";

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(!student);
  const [tab, setTab] = useState<ProfileTab>("profile");
  const [session, setSession] = useState(SESSIONS[0]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [dbUuid, setDbUuid] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { myProfile, myAssignments } = useTeacherContextStore();
  const { classes } = useClassStore();
  const backLink = user?.role === UserRole.TEACHER ? ROUTES.TEACHER.STUDENTS : ROUTES.ADMIN.STUDENTS;

  const studentClass = student ? classes.find(c => formatClassName(c.name) === student.grade) : null;
  
  const isClassTeacher = Boolean(
    user?.role === UserRole.TEACHER &&
    studentClass?.form_teacher_id &&
    myProfile?.id &&
    studentClass.form_teacher_id === myProfile.id
  );
  
  const isSubjectTeacherOnly = user?.role === UserRole.TEACHER && !isClassTeacher;
  const allowedSubjects = isSubjectTeacherOnly
    ? myAssignments.filter(a => formatClassName(a.class_name) === student?.grade).map(a => a.subject_name)
    : undefined;

  useEffect(() => {
    if (isSubjectTeacherOnly && tab !== "results") {
      setTab("results");
    }
  }, [isSubjectTeacherOnly, tab]);

  const [editOpen, setEditOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    address: "",
    phoneNumber: "",
    className: "",
  });

  const handleOpenEdit = () => {
    if (!student) return;
    const parts = student.name.split(" ");
    const first = parts[0] || "";
    const last = parts.slice(1).join(" ") || "";
    setEditForm({
      firstName: first,
      lastName: last,
      gender: student.gender,
      address: student.address,
      phoneNumber: student.phone,
      className: student.grade,
    });
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dbUuid) return;
    try {
      const updated = await updateStudentProfile(dbUuid, {
        first_name: editForm.firstName,
        last_name: editForm.lastName,
        gender: editForm.gender,
        address: editForm.address,
        phone_number: editForm.phoneNumber,
        class_name: editForm.className,
      });

      const initials = (
        (updated.first_name[0] || "") + (updated.last_name[0] || "")
      ).toUpperCase();

      setStudent({
        id: updated.admission_number || updated.id,
        name: `${updated.first_name} ${updated.last_name}`,
        initials: initials,
        avatarColor: "bg-indigo-500",
        grade: formatClassName(updated.class_name),
        gender: updated.gender,
        dob: new Date(updated.date_of_birth).toISOString().split("T")[0],
        phone: updated.phone_number,
        email: updated.email,
        address: updated.address,
        parentName: "Parent / Guardian",
        parentPhone: "+234 800 000 0001",
        parentEmail: "parent@nexusacademy.com",
        status: "Active",
        joined: student?.joined || "",
        avatar: initials,
        avatarBg: "bg-indigo-500",
      });

      setEditOpen(false);
      toast.success("Student profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    }
  };

  useEffect(() => {
    if (!id) return;

    let isLoaded = true;
    const loadStudentFromApi = async () => {
      try {
        const apiStudents = await fetchStudentsList();
        if (!isLoaded) return;

        const foundListStudent = apiStudents.find(
          (s) => s.id === id || s.admission_number === id || s.user_id === id,
        );

        if (!foundListStudent) {
          setLoading(false);
          return;
        }

        const found = await fetchStudentById(foundListStudent.admission_number);

        if (found) {
          setDbUuid(found.id);
          const initials = (
            (found.first_name[0] || "") + (found.last_name[0] || "")
          ).toUpperCase();

          const firstParent =
            found.parents && found.parents.length > 0 ? found.parents[0] : null;

          const mapped: Student = {
            id: found.admission_number || found.id,
            name: `${found.first_name} ${found.last_name}`,
            initials: initials,
            avatarColor: "bg-indigo-500",
            grade: formatClassName(found.class_name),
            gender: found.gender,
            dob: new Date(found.date_of_birth).toISOString().split("T")[0],
            phone: found.phone_number,
            email: found.email,
            address: found.address,
            parentName: firstParent
              ? `${firstParent.first_name} ${firstParent.last_name}`
              : "Parent / Guardian",
            parentPhone: firstParent ? firstParent.phone_number : "N/A",
            parentEmail: firstParent ? firstParent.email : "N/A",
            parentsList: found.parents || [],
            status: "Active",
            joined: new Date(found.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),

            avatar: initials,
            avatarBg: "bg-indigo-500",
          };

          setStudent(mapped);
        }
      } catch (err) {
        console.error("Could not fetch student details:", err);
      } finally {
        if (isLoaded) setLoading(false);
      }
    };

    loadStudentFromApi();
    return () => {
      isLoaded = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="text-sm font-medium animate-pulse">
          Loading student profile…
        </p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Users size={40} className="mb-3 opacity-40" />
        <p className="mb-4 text-sm">Student not found.</p>
        <Link
          to={backLink}
          className="font-medium text-sm text-indigo-500 hover:text-indigo-600 transition-colors flex gap-2"
        >
          <ArrowLeft size={18} />
          Back to Students
        </Link>
      </div>
    );
  }

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "results", label: "Results" },
    { id: "attendance", label: "Attendance" },
    { id: "courses", label: "Courses" },
    { id: "enrollments", label: "Enrollments" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link
          to={backLink}
          className="p-2 rounded-lg transition-colors text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate text-[22px] text-slate-900">
            {student.name}
          </h1>
          <p className="text-sm mt-0.5 text-slate-500">
            {student.id} · {student.grade} · {student.gender}
          </p>
        </div>

        {/* Session selector */}
        <div className="flex gap-2">
          {dbUuid && user?.role === UserRole.ADMIN && (
            <>
              <button
                onClick={() => setTransferOpen(true)}
                className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg text-sm font-medium border transition-all border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Transfer
              </button>
              <button
                onClick={handleOpenEdit}
                className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg text-sm font-medium border transition-all border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                Edit Profile
                <Pencil size={12} />
              </button>
            </>
          )}
          <button
            onClick={() => setSessionOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all border-indigo-500 text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
          >
            <Calendar size={14} />
            {session}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${sessionOpen ? "rotate-180" : ""}`}
            />
          </button>
          {sessionOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl overflow-hidden z-20 border border-slate-200 shadow-xl">
              {SESSIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSession(s);
                    setSessionOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    session === s
                      ? "text-indigo-600 bg-indigo-50 font-semibold"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      {!isSubjectTeacherOnly && (
        <div className="flex gap-1 p-1 rounded-xl bg-slate-100">
          {TABS.map((t) => (
            <button
              key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      )}

      {/* Content */}
      {isSubjectTeacherOnly ? (
        <ResultsTab
          studentId={student.id}
          grade={student.grade}
          session={session}
          allowedSubjects={allowedSubjects}
        />
      ) : (
        <>
          {tab === "profile" && <ProfileTab s={student} />}
          {tab === "results" && (
            <ResultsTab
              studentId={student.id}
              grade={student.grade}
              session={session}
            />
          )}
          {tab === "attendance" && (
            <AttendanceTab studentId={student.id} session={session} />
          )}
          {tab === "courses" && <CoursesTab grade={student.grade} />}
          {tab === "enrollments" && dbUuid && <EnrollmentsTab studentId={dbUuid} />}
        </>
      )}

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                Edit Student Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Gender
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white h-11"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Class/Grade
                  </label>
                  <select
                    value={editForm.className}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        className: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white h-11"
                  >
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SS 1">SS 1</option>
                    <option value="SS 2">SS 2</option>
                    <option value="SS 3">SS 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phoneNumber}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <textarea
                  required
                  rows={2}
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {dbUuid && student && (
        <TransferStudentModal
          isOpen={transferOpen}
          onClose={() => setTransferOpen(false)}
          studentId={dbUuid}
          studentName={student.name}
          onSuccess={() => {
            setTransferOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
