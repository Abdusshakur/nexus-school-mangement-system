import { useState } from "react";
import { z } from "zod";
import { useOnboardingStore } from "../../../../store/onboarding.store";
import { ArrowLeft, ArrowRight } from "lucide-react";

const stepTwoSchema = z.object({
  full_physical_address: z.string().min(5, "Address is required (min 5 characters)"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State/Region is required"),
  country: z.string().min(2, "Country is required"),
});

export function StepTwo() {
  const { payload, updatePayload, setStep } = useOnboardingStore();

  const [formData, setFormData] = useState({
    full_physical_address: payload.full_physical_address || "",
    city: payload.city || "",
    state: payload.state || "",
    country: payload.country || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = stepTwoSchema.safeParse(formData);
    
    if (result.success) {
      updatePayload(result.data);
      setStep(3);
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
        <h2 className="text-2xl font-bold text-slate-900">Location & Region</h2>
        <p className="text-slate-500 mt-2">Where is your school located?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Full Physical Address</label>
          <div className="relative">
            <input
              type="text"
              name="full_physical_address"
              value={formData.full_physical_address}
              onChange={handleChange}
              placeholder="15 Awolowo Way, Ikeja"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.full_physical_address ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.full_physical_address && <p className="text-xs text-red-500 font-medium">{errors.full_physical_address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">City</label>
            <div className="relative">
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Lagos"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.city ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.city && <p className="text-xs text-red-500 font-medium">{errors.city}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">State / Region</label>
            <div className="relative">
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Lagos State"
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                  errors.state ? "border-red-300 bg-red-50/50" : "border-slate-200"
                }`}
              />
            </div>
            {errors.state && <p className="text-xs text-red-500 font-medium">{errors.state}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Country</label>
          <div className="relative">
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g. Nigeria"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors ${
                errors.country ? "border-red-300 bg-red-50/50" : "border-slate-200"
              }`}
            />
          </div>
          {errors.country && <p className="text-xs text-red-500 font-medium">{errors.country}</p>}
        </div>

        <div className="pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              updatePayload(formData); // Save partial progress
              setStep(1);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-600 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Continue
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
