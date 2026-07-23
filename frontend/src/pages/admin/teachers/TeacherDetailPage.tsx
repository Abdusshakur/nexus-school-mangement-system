import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Edit3,
  BookOpen,
  Users,
  EyeOff,
  Eye,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "../../../config/routes";
import { useTeacherStore, type Teacher } from "../../../store/teacher.store";
import {
  CLASSES,
  classColor,
  getSubjectsForClasses,
  DEPARTMENTS,
} from "./data";
import { Modal, ClassSelector, TagSelector } from "./AddTeacher";

export function TeacherDetailPage() {
  const { id } = useParams();
  const { teachers, updateTeacher } = useTeacherStore();
  const teacher = teachers.find((t) => t.id === id);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Teacher | null>(null);
  const [showEditClasses, setShowEditClasses] = useState(false);
  const [showEditSubjects, setShowEditSubjects] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const availSubjects = getSubjectsForClasses(teacher.classes);

  const handleOpenEdit = () => {
    setEditForm({ ...teacher });
    setEditing(true);
  };

  const handleSaveProfile = () => {
    if (!editForm) return;
    updateTeacher(editForm);
    setEditing(false);
    toast.success("Teacher profile updated successfully!");
  };

  return (
    <div className="max-w-4xl space-y-6 font-inter">
      {/* Header Navigation */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ADMIN.TEACHERS}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-slate-900 text-2xl font-bold">{teacher.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {teacher.dept} ·{" "}
            <span className="font-mono">{teacher.staffId}</span>
          </p>
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

          {/* Access Password Section */}
          <div className="pt-4 border-t border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Default Login Password
            </span>
            <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-150 p-2.5 rounded-xl">
              <span className="font-mono text-sm font-bold text-slate-700 select-all">
                {showPassword ? teacher.defaultPassword : "••••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
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
                  const cls = CLASSES.find((c) => c.id === id);
                  if (!cls) return null;
                  const cs = classColor(cls.level);
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 ${cs.bg}`}
                    >
                      <Users size={15} className={cs.text} />
                      <span className={`text-xs font-bold ${cs.text}`}>
                        {cls.name} Class Stream
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
                {teacher.subjects.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-655 border border-indigo-100"
                  >
                    <BookOpen size={12} /> {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No subjects assigned.</p>
            )}
          </div>

          {/* Weekly Work Snapshot */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Faculty Weekly Snapshot
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Classes",
                  value: teacher.classes.length,
                  color: "text-indigo-600",
                  bg: "bg-indigo-50",
                },
                {
                  label: "Subjects",
                  value: teacher.subjects.length,
                  color: "text-purple-650",
                  bg: "bg-purple-50/70",
                },
                {
                  label: "Periods / wk",
                  value: teacher.classes.length * 5,
                  color: "text-amber-700",
                  bg: "bg-amber-50",
                },
              ].map(({ label, value, color, bg }) => (
                <div
                  key={label}
                  className={`text-center p-4 rounded-2xl ${bg}`}
                >
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p
                    className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${color} opacity-80`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
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
                updateTeacher({
                  ...teacher,
                  classes: toggleTag(teacher.classes, classId),
                })
              }
            />
            <button
              onClick={() => setShowEditClasses(false)}
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
                updateTeacher({
                  ...teacher,
                  subjects: toggleTag(teacher.subjects, sName),
                })
              }
              searchable
            />
            <button
              onClick={() => setShowEditSubjects(false)}
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
