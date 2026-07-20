import React, { useState } from "react";
import {
  X,
  CheckCircle,
  Copy,
  UserCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { useTeacherStore, type Teacher } from "../../../store/teacher.store";
import {
  CLASSES,
  DEPARTMENTS,
  QUALIFICATIONS,
  classColor,
  getSubjectsForClasses,
} from "./data";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export function Modal({ title, onClose, children, wide }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        className="bg-white rounded-2xl w-full overflow-y-auto flex flex-col shadow-2xl border border-slate-100"
        style={{ maxWidth: wide ? 680 : 520, maxHeight: "92vh" }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-lg text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

interface TagSelectorProps {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
  searchable?: boolean;
}

export function TagSelector({
  label,
  options,
  selected,
  onToggle,
  searchable,
}: TagSelectorProps) {
  const [q, setQ] = useState("");
  const visible = searchable
    ? options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
    : options;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100"
            >
              {s}
              <button
                type="button"
                onClick={() => onToggle(s)}
                className="ml-0.5 hover:text-indigo-800 cursor-pointer"
              >
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
      {searchable && (
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter subjects…"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all"
        />
      )}
      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
        {visible.map((o) => {
          const on = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => onToggle(o)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                on
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-slate-250 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface ClassSelectorProps {
  selected: string[];
  onToggle: (id: string) => void;
}

export function ClassSelector({ selected, onToggle }: ClassSelectorProps) {
  const junior = CLASSES.filter((c) => c.level === "junior");
  const senior = CLASSES.filter((c) => c.level === "senior");

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-slate-700">Assign Classes</p>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((id) => {
            const cls = CLASSES.find((c) => c.id === id);
            if (!cls) return null;
            const cs = classColor(cls.level);
            return (
              <span
                key={id}
                className={`flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-bold ${cs.bg} ${cs.text}`}
              >
                {cls.name}
                <button
                  type="button"
                  onClick={() => onToggle(id)}
                  className="ml-0.5 cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="space-y-3">
        {[
          { label: "Junior Secondary (JSS 1 – JSS 3)", classes: junior },
          { label: "Senior Secondary (SS 1 – SS 3)", classes: senior },
        ].map(({ label, classes }) => (
          <div key={label} className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {classes.map((c) => {
                const on = selected.includes(c.id);
                const cs = classColor(c.level);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onToggle(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer ${
                      on
                        ? `${cs.bg} border-indigo-600 text-indigo-700`
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface AddTeacherWizardProps {
  onClose: () => void;
}

type AssignStep = "info" | "assign" | "confirm";

export function AddTeacherWizard({ onClose }: AddTeacherWizardProps) {
  const { addTeacher } = useTeacherStore();
  const [step, setStep] = useState<AssignStep>("info");
  const [created, setCreated] = useState<Teacher | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "Male",
    qualification: "B.Sc. + PGDE",
    department: "Sciences",
    address: "",
    classes: [] as string[],
    subjects: [] as string[],
  });

  const toggleClass = (id: string) => {
    setForm((f) => ({
      ...f,
      classes: f.classes.includes(id)
        ? f.classes.filter((x) => x !== id)
        : [...f.classes, id],
    }));
  };

  const toggleSubject = (s: string) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.includes(s)
        ? f.subjects.filter((x) => x !== s)
        : [...f.subjects, s],
    }));
  };

  const availableSubjects = getSubjectsForClasses(form.classes);

  const infoValid =
    form.name.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.department;

  const handleCreate = () => {
    const teacher = addTeacher({
      name: form.name,
      email: form.email,
      phone: form.phone,
      gender: form.gender,
      qualification: form.qualification,
      dept: form.department,
      address: form.address,
      classes: form.classes,
      subjects: form.subjects,
      status: "Active",
    });
    setCreated(teacher);
    setStep("confirm");
  };

  const copyCredentials = () => {
    if (!created) return;
    navigator.clipboard.writeText(
      `Staff ID: ${created.staffId}\nEmail: ${created.email}\nPassword: ${created.defaultPassword}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STEPS: { key: AssignStep; label: string }[] = [
    { key: "info", label: "Personal Info" },
    { key: "assign", label: "Classes & Subjects" },
    { key: "confirm", label: "Credentials" },
  ];

  return (
    <Modal title="Create New Teacher" onClose={onClose} wide>
      {/* Progress */}
      <div className="flex items-center gap-0 mb-6 border-b border-slate-100 pb-5">
        {STEPS.map((s, i) => {
          const done = STEPS.findIndex((x) => x.key === step) > i;
          const active = s.key === step;
          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    active
                      ? "bg-indigo-600 text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:block ${
                    active
                      ? "text-indigo-600"
                      : done
                        ? "text-emerald-500"
                        : "text-slate-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full ${
                    done ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step: Personal Info */}
      {step === "info" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="e.g. Mrs. Chioma Eze"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="chioma@westwood.edu"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+234 803 000 0000"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({ ...f, gender: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department *
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Qualification
              </label>
              <select
                value={form.qualification}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qualification: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              >
                {QUALIFICATIONS.map((q) => (
                  <option key={q}>{q}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Address
              </label>
              <input
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                placeholder="Residential address"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setStep("assign")}
              disabled={!infoValid}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              Assign Classes <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step: Classes & Subjects */}
      {step === "assign" && (
        <div className="space-y-5">
          <ClassSelector selected={form.classes} onToggle={toggleClass} />
          <TagSelector
            label={`Assign Subjects ${
              form.classes.length === 0
                ? "(select classes first to filter)"
                : `(${availableSubjects.length} available)`
            }`}
            options={availableSubjects}
            selected={form.subjects}
            onToggle={toggleSubject}
            searchable
          />
          {form.subjects.length === 0 && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
              <AlertCircle
                size={15}
                className="shrink-0 mt-0.5 text-amber-600"
              />
              <p className="text-xs font-medium">
                A teacher should be assigned at least one subject.
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep("info")}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={form.subjects.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <UserCheck size={15} /> Create Teacher Profile
            </button>
          </div>
        </div>
      )}

      {/* Step: Credentials */}
      {step === "confirm" && created && (
        <div className="space-y-4">
          <div className="text-center py-4 border-b border-slate-100">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-2xl shadow-md ${created.avatarColor}`}
            >
              <span>{created.avatar}</span>
            </div>
            <p className="font-extrabold text-lg text-slate-900">
              {created.name}
            </p>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">
              {created.dept} · Staff ID: {created.staffId}
            </p>
          </div>

          <div className="rounded-xl p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Generated Login Credentials
            </p>
            {[
              { label: "Staff ID", value: created.staffId },
              { label: "Email", value: created.email },
              { label: "Default Password", value: created.defaultPassword },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center text-sm"
              >
                <div>
                  <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wide">
                    {label}
                  </p>
                  <p className="font-mono font-bold text-indigo-900">{value}</p>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={copyCredentials}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all cursor-pointer mt-1"
            >
              <Copy size={13} /> {copied ? "Copied!" : "Copy Credentials"}
            </button>
          </div>

          <div className="rounded-xl p-3 bg-amber-50 border border-amber-200 text-amber-900 flex gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="text-xs font-medium leading-normal">
              Share these credentials with the teacher. They must change their
              password on first login.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assigned: {created.classes.length} class
              {created.classes.length !== 1 ? "es" : ""} ·{" "}
              {created.subjects.length} subject
              {created.subjects.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {created.subjects.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 transition-all cursor-pointer text-center"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
