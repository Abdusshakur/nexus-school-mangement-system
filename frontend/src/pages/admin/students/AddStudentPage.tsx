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
import { createStudent } from "../../../api/students";

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
  // Parent / Guardian 1 (Required)
  p1_first_name: string;
  p1_last_name: string;
  p1_phone: string;
  p1_email: string;
  p1_role: string;
  // Parent / Guardian 2 (Optional)
  p2_first_name: string;
  p2_last_name: string;
  p2_phone: string;
  p2_email: string;
  p2_role: string;
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
    p1_first_name: "",
    p1_last_name: "",
    p1_phone: "",
    p1_email: "",
    p1_role: "",
    p2_first_name: "",
    p2_last_name: "",
    p2_phone: "",
    p2_email: "",
    p2_role: "",
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
      !form.p1_first_name ||
      !form.p1_last_name ||
      !form.p1_phone
    ) {
      toast.error("Please complete all required fields.");
      setSaving(false);
      return;
    }

    try {
      const p1RoleMap: Record<string, string> = {
        Father: "FATHER",
        Mother: "MOTHER",
        Guardian: "GUARDIAN",
      };

      const parent1Email =
        form.p1_email ||
        `${form.first_name.toLowerCase()}.${form.last_name.toLowerCase()}.parent1@nexusacademy.com`;

      const parentsArray = [
        {
          first_name: form.p1_first_name,
          last_name: form.p1_last_name,
          email: parent1Email,
          phone_number: form.p1_phone,
          relationship_type: p1RoleMap[form.p1_role] || "GUARDIAN",
          is_primary_contact: true,
          is_financial_sponsor: true,
        },
      ];

      if (form.p2_first_name && form.p2_last_name && form.p2_phone) {
        const parent2Email =
          form.p2_email ||
          `${form.first_name.toLowerCase()}.${form.last_name.toLowerCase()}.parent2@nexusacademy.com`;

        parentsArray.push({
          first_name: form.p2_first_name,
          last_name: form.p2_last_name,
          email: parent2Email,
          phone_number: form.p2_phone,
          relationship_type: p1RoleMap[form.p2_role] || "GUARDIAN",
          is_primary_contact: false,
          is_financial_sponsor: false,
        });
      }

      const validFormDetails = {
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        gender: form.gender,
        date_of_birth: form.dob || new Date().toISOString().split("T")[0],
        address: form.address,
        phone_number: form.phone || null,
        class_name: form.class_name,
        parents: parentsArray,
      };


      const data = await createStudent(validFormDetails);


      setSuccessData({
        name: `${form.first_name} ${form.last_name}`,
        email: form.email,
        admissionNumber: data.admission_number || "Generated by system",
        password: form.password,
      });

      toast.success("Student profile successfully registered!");
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected network error occurred.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6 font-inter">
      <div className="flex items-center gap-3">
        <Link
          to={ROUTES.ADMIN.STUDENTS}
          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
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
        {/* SECTION 1: Student Demographics */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                Student Profile Information
              </h2>
              <p className="text-xs text-slate-400">
                Personal identity & academic grade stream
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="First Name"
              id="first_name"
              form={form}
              set={set}
              placeholder="e.g. Amelia"
              required
            />
            <Field
              label="Last Name"
              id="last_name"
              form={form}
              set={set}
              placeholder="e.g. Johnson"
              required
            />
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Admission Number
              </label>
              <input
                disabled
                placeholder="Auto-generated on save (e.g. NEX-2026-0001)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-400 bg-slate-50 font-medium select-none"
              />
            </div>

            <Field
              label="Class / Grade Stream"
              id="class_name"
              form={form}
              set={set}
              options={["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"]}
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
              options={["Male", "Female"]}
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

        {/*  Parent & Guardian Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 text-base">
                Parent & Guardian Details
              </h2>
              <p className="text-xs text-slate-400">
                Contact information for Parent/Guardian 1 and Parent/Guardian 2
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Parent / Guardian 1 */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 ">
                Parent / Guardian 1
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  id="p1_first_name"
                  form={form}
                  set={set}
                  placeholder="e.g. Olakunle"
                  required
                />
                <Field
                  label="Last Name"
                  id="p1_last_name"
                  form={form}
                  set={set}
                  placeholder="e.g. Adeyemo"
                  required
                />
                <Field
                  label="Phone Contact"
                  id="p1_phone"
                  type="tel"
                  form={form}
                  set={set}
                  placeholder="e.g. 080..."
                  required
                />
                <Field
                  label="Email Address (Optional)"
                  id="p1_email"
                  type="email"
                  form={form}
                  set={set}
                  placeholder="olakunle@gmail.com"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Role / Relationship"
                    id="p1_role"
                    form={form}
                    set={set}
                    options={["Father", "Mother", "Guardian"]}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent / Guardian 2 */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-500 uppercase ">
                Parent / Guardian 2
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  id="p2_first_name"
                  form={form}
                  set={set}
                  placeholder="e.g. Itunu"
                />
                <Field
                  label="Last Name"
                  id="p2_last_name"
                  form={form}
                  set={set}
                  placeholder="e.g. Abike"
                />
                <Field
                  label="Phone Contact"
                  id="p2_phone"
                  type="tel"
                  form={form}
                  set={set}
                  placeholder="e.g. 080..."
                />
                <Field
                  label="Email Address"
                  id="p2_email"
                  type="email"
                  form={form}
                  set={set}
                  placeholder="itunu@gmail.com"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Role / Relationship"
                    id="p2_role"
                    form={form}
                    set={set}
                    options={["Mother", "Father", "Guardian"]}
                  />
                </div>
              </div>
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

        {/*  Form Action Buttons */}
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
            {saving ? "Saving..." : "Save Record"}
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
