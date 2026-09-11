import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useOnboardingStore } from "../../../../store/onboarding.store";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Spinner } from "../../../../components/ui/Spinner";

const stepThreeSchema = z.object({
  owner_first_name: z.string().min(2, "First name is required"),
  owner_last_name: z.string().min(2, "Last name is required"),
  owner_email: z.string().email("Invalid email address"),
  owner_phone: z.string().min(8, "Valid phone number is required"),
  owner_password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string()
}).refine((data) => data.owner_password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

export function StepThree() {
  const navigate = useNavigate();
  const { payload, updatePayload, setStep, submitApplication, isSubmitting } = useOnboardingStore();

  const [formData, setFormData] = useState({
    owner_first_name: payload.owner_first_name || "",
    owner_last_name: payload.owner_last_name || "",
    owner_email: payload.owner_email || "",
    owner_phone: payload.owner_phone || "",
    owner_password: payload.owner_password || "",
    confirm_password: payload.owner_password || "", // prefill if they go back
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = stepThreeSchema.safeParse(formData);
    
    if (result.success) {
      // Don't send confirm_password to the backend
      const { confirm_password, ...apiPayload } = result.data;
      
      updatePayload(apiPayload);
      
      const success = await submitApplication();
      if (success) {
        navigate("/onboarding/success");
      }
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
        <h2 className="text-2xl font-bold text-slate-900">Administrator Setup</h2>
        <p className="text-slate-500 mt-2">Create the primary owner account for the school.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">First Name</label>
            <div className="relative">
              <input
                type="text"
                name="owner_first_name"
                value={formData.owner_first_name}
                onChange={handleChange}
                placeholder="Chinedu"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.owner_first_name ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.owner_first_name && <p className="text-xs text-red-500 font-medium">{errors.owner_first_name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Last Name</label>
            <div className="relative">
              <input
                type="text"
                name="owner_last_name"
                value={formData.owner_last_name}
                onChange={handleChange}
                placeholder="Okafor"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.owner_last_name ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.owner_last_name && <p className="text-xs text-red-500 font-medium">{errors.owner_last_name}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Owner Email Address</label>
          <div className="relative">
            <input
              type="email"
              name="owner_email"
              value={formData.owner_email}
              onChange={handleChange}
              placeholder="admin@excellence.edu.ng"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.owner_email ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.owner_email && <p className="text-xs text-red-500 font-medium">{errors.owner_email}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Owner Phone Number</label>
          <div className="relative">
            <input
              type="tel"
              name="owner_phone"
              value={formData.owner_phone}
              onChange={handleChange}
              placeholder="+234 800 000 0000"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.owner_phone ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.owner_phone && <p className="text-xs text-red-500 font-medium">{errors.owner_phone}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Password</label>
            <div className="relative">
              <input
                type="password"
                name="owner_password"
                value={formData.owner_password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.owner_password ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.owner_password && <p className="text-xs text-red-500 font-medium">{errors.owner_password}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.confirm_password ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.confirm_password && <p className="text-xs text-red-500 font-medium">{errors.confirm_password}</p>}
          </div>
        </div>

        <div className="pt-6 flex justify-between items-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => {
              // save progress and go back
              const { confirm_password, ...apiPayload } = formData;
              updatePayload(apiPayload);
              setStep(2);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Spinner className="w-4 h-4 text-white" />
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <CheckCircle2 size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
