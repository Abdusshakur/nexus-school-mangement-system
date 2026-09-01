import React, { useState } from "react";
import { X } from "lucide-react";
import { useParentStore } from "../../../store/parent.store";
import { toast } from "sonner";
import { Spinner } from "../../../components/ui/Spinner";

interface AddParentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddParentModal({ isOpen, onClose, onSuccess }: AddParentModalProps) {
  const { addParent, loading } = useParentStore();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.phone_number) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      await addParent(formData);
      toast.success("Parent created successfully! Default password is 'WelcomeNexus2026!'");
      setFormData({ first_name: "", last_name: "", email: "", phone_number: "" });
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Failed to create parent.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Add New Parent</h2>
            <p className="text-xs text-slate-500 mt-1">
              Create a standalone parent profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white"
                placeholder="e.g., John"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white"
                placeholder="e.g., Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white"
              placeholder="e.g., john.doe@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="text"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-slate-50 focus:bg-white"
              placeholder="e.g., +234 801 234 5678"
              required
            />
          </div>
          
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>Note:</strong> The parent's default password will be <span className="font-mono bg-white px-1 py-0.5 rounded border border-indigo-200">WelcomeNexus2026!</span>. They can use this along with their email to log in.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center gap-2"
            >
              {loading && <Spinner size="sm" className="text-white" />}
              {loading ? "Creating..." : "Create Parent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
