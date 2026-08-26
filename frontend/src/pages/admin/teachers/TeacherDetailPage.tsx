import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Edit3,
  Users,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../../../config/routes";
import { useTeacherStore, type Teacher } from "../../../store/teacher.store";
import {
  fetchTeacherById,
  assignTeacherClasses,
  assignTeacherSubjects,
} from "../../../api/teachers";
import {
  formatPhoneNumber,
  formatParentInitials,
} from "../../../utils/formatters";
import { useClassStore } from "../../../store/class.store";
import { useSubjectStore } from "../../../store/subject.store";
import { DEPARTMENTS } from "./data";
import { Modal, ClassSelector, TagSelector } from "./AddTeacher";

export function TeacherDetailPage() {
  const { id } = useParams();
  const { teachers, updateTeacher } = useTeacherStore();
  const { classes, loadClasses } = useClassStore();
  const { subjects, loadSubjects } = useSubjectStore();

  // Use existing basic info from the list as initial state if available
  const existingTeacher = teachers.find((t) => t.id === id);
  const [teacher, setTeacher] = useState<Teacher | undefined>(existingTeacher);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, [loadClasses, loadSubjects]);

  useEffect(() => {
    if (!id) return;

    fetchTeacherById(id)
      .then((data) => {
        // Map backend TeacherDetailResponse to frontend Teacher interface
        setTeacher({
          id: data.id,
          user_id: data.user_id,
          staffId: data.id.substring(0, 8).toUpperCase(),
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          phone: formatPhoneNumber(data.phone_number),
          gender: data.gender,
          qualification: data.qualification,
          dept: data.department,
          title: `${data.qualification || "Teacher"}`,
          address: data.address,
          classes: data.assigned_classes.map((c) => c.id),
          subjects: data.assigned_subjects.map((s) => s.id),
          status: "Active",
          avatar: formatParentInitials(`${data.first_name} ${data.last_name}`),
          avatarColor: "bg-indigo-500",
          experience: "1 Year",
          classrooms: data.assigned_classes.length,
          created_at: data.created_at,
        });
      })
      .catch((error) => {
        console.error("Failed to fetch teacher profile:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Teacher | null>(null);
  const [showEditClasses, setShowEditClasses] = useState(false);
  const [showEditSubjects, setShowEditSubjects] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="mb-4 animate-pulse">Loading teacher profile...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <p className="mb-4">Teacher profile not found.</p>
        <Link
          to={ROUTES.ADMIN.TEACHERS}
          className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Back to Teachers Directory
        </Link>
      </div>
    );
  }

  const toggleTag = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  const availSubjects = subjects;

  const handleOpenEdit = () => {
    setEditForm({ ...teacher });
    setEditing(true);
  };

  const syncGlobalStore = (t: Teacher) => {
    updateTeacher({
      ...t,
      classes: t.classes.map((id) => classes.find((c) => c.id === id)?.name || id),
      subjects: t.subjects.map((id) => subjects.find((s) => s.id === id)?.name || id),
    });
  };

  const handleSaveProfile = async () => {
    if (!editForm || !id) return;

    try {
      toast.info("Updating profile....");
      syncGlobalStore(editForm);
      setTeacher(editForm);
      setEditing(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  const handleSaveClasses = async () => {
    if (!id || !teacher) return;
    try {
      await assignTeacherClasses(id, teacher.classes);
      toast.success("Classes assigned successfully");
      syncGlobalStore(teacher);
      setShowEditClasses(false);
    } catch {
      toast.error("Failed to assign classes");
    }
  };

  const handleSaveSubjects = async () => {
    if (!id || !teacher) return;
    try {
      await assignTeacherSubjects(id, teacher.subjects);
      toast.success("Subjects assigned successfully");
      syncGlobalStore(teacher);
      setShowEditSubjects(false);
    } catch {
      toast.error("Failed to assign subjects");
    }
  };

  return (
    <div className="max-w-4xl space-y-6 font-inter">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ADMIN.TEACHERS}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-slate-900 text-2xl font-bold">{teacher.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{teacher.dept}</p>
        </div>
        <button
          onClick={handleOpenEdit}
          className="flex items-center gap-2 px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
        >
          <Edit3 size={14} /> Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm h-fit space-y-5">
          <div className="text-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-3xl shadow-sm ${teacher.avatarColor}`}
            >
              <span>{teacher.avatar}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              {teacher.name}
            </h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
              {teacher.title}
            </p>
            <span
              className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${
                teacher.status === "Active"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              {teacher.status}
            </span>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            {[
              { icon: Phone, label: "Direct Phone", value: teacher.phone },
              { icon: Mail, label: "Email Address", value: teacher.email },
              {
                icon: MapPin,
                label: "Residential Address",
                value: teacher.address,
              },
              {
                icon: GraduationCap,
                label: "Educational Qualification",
                value: teacher.qualification,
              },
            ].map(({ icon: Icon, label, value }) => {
              if (!value) return null;
              return (
                <div key={label} className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {label}
                  </span>
                  <div className="flex items-start gap-2 text-slate-700 text-sm font-semibold leading-normal">
                    <Icon
                      size={14}
                      className="text-slate-400 shrink-0 mt-0.5"
                    />
                    <span className="break-all">{value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Section */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Account Security
              </span>
              <p className="text-xs font-semibold text-slate-500">
                Reset the teacher's password by sending a reset link to their
                registered email address.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Password reset link sent to teacher.")}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              Reset Password
            </button>
          </div>
        </div>

        {/* Right Side Class & Schedule Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Assignments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Assigned Classrooms ({teacher.classes.length})
              </h3>
              <button
                onClick={() => setShowEditClasses(true)}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Assignments
              </button>
            </div>
            {teacher.classes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacher.classes.map((id) => {
                  const cls = classes.find((c) => c.id === id);
                  if (!cls) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-indigo-50"
                    >
                      <Users size={15} className="text-indigo-700" />
                      <span className="text-xs font-bold text-indigo-700">
                        {cls.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                No classes assigned to this faculty member.
              </p>
            )}
          </div>

          {/* Subjects Assignments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                Assigned Subjects ({teacher.subjects.length})
              </h3>
              <button
                onClick={() => setShowEditSubjects(true)}
                className="text-xs font-bold text-indigo-650 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Edit3 size={12} /> Edit Assignments
              </button>
            </div>
            {teacher.subjects.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {teacher.subjects.map((id) => {
                  const subject = subjects.find((s) => s.id === id);
                  if (!subject) return null;
                  return (
                    <span
                      key={id}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700"
                    >
                      {subject.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No subjects assigned.</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editing && editForm && (
        <Modal title="Edit Teacher Profile" onClose={() => setEditing(false)}>
          <div className="space-y-4">
            {[
              { label: "Full Name", key: "name" },
              { label: "Email", key: "email" },
              { label: "Phone", key: "phone" },
              { label: "Address", key: "address" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {label}
                </label>
                <input
                  value={editForm[key as keyof Teacher] as string}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, [key]: e.target.value } : f,
                    )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={editForm.dept}
                  onChange={(e) =>
                    setEditForm((f) => (f ? { ...f, dept: e.target.value } : f))
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((f) =>
                      f ? { ...f, status: e.target.value } : f,
                    )
                  }
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
                >
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleSaveProfile}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm"
              >
                <Save size={14} /> Save Profile Details
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Assigned Classes Modal */}
      {showEditClasses && (
        <Modal
          title="Edit Class Assignments"
          onClose={() => setShowEditClasses(false)}
          wide
        >
          <div className="space-y-4">
            <ClassSelector
              selected={teacher.classes}
              onToggle={(classId) =>
                setTeacher({
                  ...teacher,
                  classes: toggleTag(teacher.classes, classId),
                })
              }
            />
            <button
              onClick={handleSaveClasses}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* Edit Assigned Subjects Modal */}
      {showEditSubjects && (
        <Modal
          title="Edit Subject Assignments"
          onClose={() => setShowEditSubjects(false)}
          wide
        >
          <div className="space-y-4">
            <TagSelector
              label="Available subjects based on assigned class streams"
              options={availSubjects}
              selected={teacher.subjects}
              onToggle={(sName) =>
                setTeacher({
                  ...teacher,
                  subjects: toggleTag(teacher.subjects, sName),
                })
              }
              searchable
            />
            <button
              onClick={handleSaveSubjects}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold cursor-pointer transition-colors shadow-sm"
            >
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
