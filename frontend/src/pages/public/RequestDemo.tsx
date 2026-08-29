import { useState } from "react";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  CalendarCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../../assets/images/logo2.svg";

export default function RequestDemo() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    schoolName: "",
    schoolMotto: "",
    phoneNumber: "",
    emailAddress: "",
    website: "",
    address: "",
    principalName: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Request Received!
          </h2>
          <p className="text-slate-500 mb-10 leading-relaxed text-sm">
            Thank you for your interest in NexusSchoolEngine. Our team will
            review your school's details and contact you shortly to schedule a
            personalized demo.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side*/}
      <div className="hidden lg:flex lg:w-5/12 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center mb-16 hover:opacity-80 transition-opacity"
          >
            <img src={Logo} alt="Nexus Logo" className="h-10 w-auto" />
          </Link>

          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            Run your school from one dashboard.
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed max-w-md mb-12">
            Join hundreds of schools already using Nexus to simplify their daily
            administration and communication.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                <Users className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h3 className="font-bold text-white">All-in-One Platform</h3>
                <p className="text-indigo-200 text-sm">
                  Manage students, teachers, and parents
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                <CalendarCheck className="w-6 h-6 text-indigo-100" />
              </div>
              <div>
                <h3 className="font-bold text-white">Automated Workflows</h3>
                <p className="text-indigo-200 text-sm">
                  Simplify grading and attendance
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 xl:px-24 bg-white relative">
        <div className="absolute top-6 right-6 lg:hidden">
          <Link
            to="/"
            className="text-sm font-bold text-slate-400 hover:text-slate-600"
          >
            Cancel
          </Link>
        </div>

        <div className="w-full max-w-xl mx-auto lg:mx-0">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Request a Demo
            </h2>
            <p className="text-slate-500">
              Tell us a bit about your school. We'll get in touch to give a
              walkthrough of the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  School Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="text"
                    value={form.schoolName}
                    onChange={(e) => setField("schoolName", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="e.g. Nexus International Academy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  School Motto
                </label>
                <input
                  type="text"
                  value={form.schoolMotto}
                  onChange={(e) => setField("schoolMotto", e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="e.g. Excellence in Education"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Principal's Name
                </label>
                <input
                  type="text"
                  value={form.principalName}
                  onChange={(e) => setField("principalName", e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="e.g. Dr. John Makolo"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="email"
                    value={form.emailAddress}
                    onChange={(e) => setField("emailAddress", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="contact@school.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    required
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => setField("phoneNumber", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
                  Physical Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 pt-3.5 pointer-events-none">
                    <MapPin className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all resize-none font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                    placeholder="Enter full school address..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold tracking-wide py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 active:scale-95 flex justify-center"
              >
                Submit Request
              </button>
            </div>

            <p className="text-xs text-slate-400 text-center sm:text-left mt-6">
              By submitting this form, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
