import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";

// 1. Define the Student Form interface for safety type tracking
interface StudentForm {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  grade: string;
  email: string;
  phone: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
}

// 2. Declare the Field component OUTSIDE the parent component render lifecycle
interface FieldProps {
  label: string;
  id: keyof StudentForm;
  form: StudentForm;
  set: (key: keyof StudentForm, val: string) => void;
  type?: string;
  required?: boolean;
  options?: string[];
}

const Field = ({
  label,
  id,
  form,
  set,
  type = "text",
  required,
  options,
}: FieldProps) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {options ? (
      <select
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white transition-all"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={form[id]}
        onChange={(e) => set(id, e.target.value)}
        required={required}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
      />
    )}
  </div>
);

// 3. Main Page Functional Component
export function AddStudent() {
  const navigate = useNavigate();
  const [form, setForm] = useState<StudentForm>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    grade: "",
    email: "",
    phone: "",
    address: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof StudentForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigate("/students");
    }, 800);
  };

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <Link
          to="/students"
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Add Student</h1>
          <p className="text-slate-500 text-sm mt-0.5">Enroll a new student</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 text-base">
            Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="First Name"
              id="firstName"
              form={form}
              set={set}
              required
            />
            <Field
              label="Last Name"
              id="lastName"
              form={form}
              set={set}
              required
            />
            <Field
              label="Date of Birth"
              id="dob"
              type="date"
              form={form}
              set={set}
              required
            />
            <Field
              label="Gender"
              id="gender"
              form={form}
              set={set}
              options={["Male", "Female", "Other"]}
              required
            />
            <Field
              label="Grade"
              id="grade"
              form={form}
              set={set}
              options={[
                "Grade 7",
                "Grade 8",
                "Grade 9",
                "Grade 10",
                "Grade 11",
                "Grade 12",
              ]}
              required
            />
            <Field
              label="Phone Number"
              id="phone"
              type="tel"
              form={form}
              set={set}
            />
          </div>
          <div className="mt-4">
            <Field
              label="Email Address"
              id="email"
              type="email"
              form={form}
              set={set}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Home Address
            </label>
            <input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4 text-base">
            Parent / Guardian
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Parent Name"
              id="parentName"
              form={form}
              set={set}
              required
            />
            <Field
              label="Parent Phone"
              id="parentPhone"
              type="tel"
              form={form}
              set={set}
              required
            />
          </div>
          <div className="mt-4">
            <Field
              label="Parent Email"
              id="parentEmail"
              type="email"
              form={form}
              set={set}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-lg text-sm font-semibold hover:bg-indigo-600 transition-colors disabled:opacity-70"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving…" : "Save Student"}
          </button>
          <Link
            to="/students"
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-500 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <X size={16} /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export function AddStudentPage() {
  return <AddStudent />;
}
