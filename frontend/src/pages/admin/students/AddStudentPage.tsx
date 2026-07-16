import { ROUTES } from "../../../config/routes";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  X,
  ShieldAlert,
  GraduationCap,
  Users,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE, getAuthHeaders } from "../../../api/client";

interface CombinedStudentForm {
  email: string;
  password: string;
  admission_number: string;
  class_name: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  phone: string;
  address: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
}

interface FieldProps {
  label: string;
  id: keyof CombinedStudentForm;
  form: CombinedStudentForm;
  set: (key: keyof CombinedStudentForm, val: string) => void;
  type?: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

const Field = ({
  label,
  id,
  form,
  set,
  type = "text",
  required,
  options,
  placeholder,
}: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold text-slate-700">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {options ? (
      <select
        value={form[id] || ""}
        onChange={(e) => set(id, e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white transition-all cursor-pointer"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={form[id] || ""}
        onChange={(e) => set(id, e.target.value)}
        required={required}
        className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white ${
          type === "date" || id === "admission_number" ? "font-mono" : ""
        }`}
      />
    )}
  </div>
);

export function AddStudent() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CombinedStudentForm>({
    email: "",
    password: "",
    admission_number: "",
    class_name: "",
    first_name: "",
    last_name: "",
    dob: "",
    gender: "",
    phone: "",
    address: "",
    parent_name: "",
    parent_phone: "",
    parent_email: "",
  });
  const [successData, setSuccessData] = useState<{
    name: string;
    email: string;
    admissionNumber: string;
    password: string;
  } | null>(null);
  const set = (key: keyof CombinedStudentForm, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleGenerateCredentials = () => {
    const firstName = form.first_name.trim().toLowerCase();
    const lastName = form.last_name.trim().toLowerCase();

    if (!firstName || !lastName) {
      toast.error("Please input First Name and Last Name first");
      return;
    }

    // const currentYear = new Date().getFullYear();ƶ
    const numericSuffix = Math.floor(1000 + Math.random() * 9000);

    const generatedEmail = `${firstName}${lastName}${numericSuffix}@nexusacademy.com`;
    const generatedPassword = Math.random().toString(36).slice(-8) + "Nx1!";

    setForm((prev) => ({
      ...prev,
      email: generatedEmail,
      password: generatedPassword,
    }));

    toast.success("Student email & password generated successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (
      !form.email ||
      !form.password ||
      !form.first_name ||
      !form.last_name ||
      !form.class_name ||
      !form.gender ||
      !form.address ||
      !form.parent_name ||
      !form.parent_phone ||
      !form.parent_email
    ) {
      toast.error("Please complete all required fields.");
      setSaving(false);
      return;
    }

    try {
      const nameParts = form.parent_name.trim().split(/\s+/);
      const parentFirstName = nameParts[0] || "";
      const parentLastName = nameParts.slice(1).join(" ") || "Guardian";

      const validFormDetails = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        address: form.address,
        phone_number: form.phone || null,
        class_name: form.class_name,
        parent: {
          first_name: parentFirstName,
          last_name: parentLastName,
          email: form.parent_email,
          phone_number: form.parent_phone,
        },
      };

      const response = await fetch(`${API_BASE}/students/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(validFormDetails),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.[0]?.msg ||
            data.detail ||
            "Failed to save profile record.",
        );
      }

      setSuccessData({
        name: `${form.first_name} ${form.last_name}`,
        email: form.email,
        admissionNumber: data.admission_number,
        password: form.password,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 font-inter">
      {/* Upper Navigation Bar */}
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ADMIN.STUDENTS}
          className="p-2 rounded-lg  border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-slate-900 text-2xl font-bold">Enroll Student</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Provision academic records and secure systemic web credentials
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Information */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                Personal Profile
              </h2>
              <p className="text-xs text-slate-400">
                Core registration tracking parameters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="First Name"
              id="first_name"
              form={form}
              set={set}
              placeholder="e.g. Wasiu"
              required
            />
            <Field
              label="Last Name"
              id="last_name"
              form={form}
              set={set}
              placeholder="e.g. Ogunmepon"
              required
            />

            {/* Dynamic Admission Generator Input Block */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Admission Number
              </label>
              <input
                type="text"
                name="admission_number"
                value="Auto-generated on Save"
                disabled
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 font-medium select-none"
              />
            </div>

            <Field
              label="Class / Grade Stream"
              id="class_name"
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
              label="Student Phone (Optional)"
              id="phone"
              type="tel"
              placeholder="e.g. 080..."
              form={form}
              set={set}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Residential Address
            </label>
            <input
              value={form.address || ""}
              placeholder="Enter current physical address"
              onChange={(e) => set("address", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* SECTION 2: Parent / Guardian Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                Parent & Guardian
              </h2>
              <p className="text-xs text-slate-400">
                Guardian contact infromation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Full Name"
              id="parent_name"
              form={form}
              set={set}
              placeholder="e.g. Marcus Johnson"
              required
            />
            <Field
              label="Phone Contact"
              id="parent_phone"
              type="tel"
              form={form}
              set={set}
              placeholder="e.g. 080..."
              required
            />
            <div className="sm:col-span-2">
              <Field
                label="Email Address"
                id="parent_email"
                type="email"
                form={form}
                set={set}
                placeholder="parent@example.com"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: System Access Account Verification Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                Portal Access Account
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Login credentials for student portal access.
              </p>
            </div>
            <button
              type="button"
              onClick={handleGenerateCredentials}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center font-inter"
            >
              Generate Credentials
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Student Login Email"
              id="email"
              type="email"
              form={form}
              set={set}
              placeholder="student@nexusacademy.com"
              required
            />
            <Field
              label="Student Login Password"
              id="password"
              form={form}
              set={set}
              placeholder="Secure passkey code"
              required
            />
          </div>

          <div className="flex gap-2.5 items-start bg-amber-50/50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs">
            <ShieldAlert size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-normal">
              Clicking the generate button auto-fills email and password
              credentials. Keep somewhere safe before saving.
            </p>
          </div>
        </div>

        {/* Bottom Form Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Link
            to={ROUTES.ADMIN.STUDENTS}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X size={15} /> Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Provisioning..." : "Save Record"}
          </button>
        </div>
      </form>

      {successData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 transform scale-100 transition-all font-inter animate-in fade-in zoom-in duration-200">
            <div className="text-center pb-4 mb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Student Onboarded Successfully!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Please copy or write down the student credentials before
                continuing.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Full Name
                </label>
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-800">
                  {successData.name}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Admission Number
                </label>
                <div className="px-3.5 py-2.5 bg-indigo-50/55 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 font-mono">
                  {successData.admissionNumber}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Portal Login Email
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 font-mono select-all">
                    {successData.email}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(successData.email);
                      toast.success("Email copied!");
                    }}
                    className="px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-950 transition-colors rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                  Portal Password
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-800 font-mono select-all">
                    {successData.password}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(successData.password);
                      toast.success("Password copied!");
                    }}
                    className="px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-950 transition-colors rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigate(ROUTES.ADMIN.STUDENTS)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer text-center font-inter"
              >
                Go to Student List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AddStudentPage() {
  return <AddStudent />;
}
