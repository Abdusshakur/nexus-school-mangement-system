import { useState } from "react";
import { z } from "zod";
import { useOnboardingStore } from "../../../../store/onboarding.store";
import { ArrowRight } from "lucide-react";

const stepOneSchema = z.object({
  school_name: z.string().min(3, "School name is required (min 3 characters)"),
  school_email: z.string().email("Invalid email address"),
  school_phone: z.string().min(8, "Valid phone number is required"),
});

export function StepOne() {
  const { payload, updatePayload, setStep } = useOnboardingStore();

  const [formData, setFormData] = useState({
    school_name: payload.school_name || "",
    school_email: payload.school_email || "",
    school_phone: payload.school_phone || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = stepOneSchema.safeParse(formData);
    
    if (result.success) {
      updatePayload(result.data);
      setStep(2);
    } else {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(newErrors);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Welcome to Nexus</h2>
        <p className="text-slate-500 mt-2">Let's start with your school's basic details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">School Name</label>
          <div className="relative">
            <input
              type="text"
              name="school_name"
              value={formData.school_name}
              onChange={handleChange}
              placeholder="e.g. Excellence International Academy"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.school_name ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.school_name && <p className="text-xs text-red-500 font-medium">{errors.school_name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Official School Email</label>
          <div className="relative">
            <input
              type="email"
              name="school_email"
              value={formData.school_email}
              onChange={handleChange}
              placeholder="info@excellence.edu.ng"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.school_email ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.school_email && <p className="text-xs text-red-500 font-medium">{errors.school_email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">School Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              name="school_phone"
              value={formData.school_phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.school_phone ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.school_phone && <p className="text-xs text-red-500 font-medium">{errors.school_phone}</p>}
        </div>

        <div className="pt-6">
          <button
            type="submit"
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
