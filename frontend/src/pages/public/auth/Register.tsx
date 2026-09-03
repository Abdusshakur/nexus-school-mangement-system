import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Dashboard from "../../../../src/assets/images/hero.png";
import Logo from "../../../../src/assets/images/logo2.svg";
import SecondLogo from "../../../../src/assets/images/logo.svg";
import { registerSchoolAdmin } from "../../../api/auth";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();

    if (!schoolName || !ownerName || !email || !password || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const [firstName, ...lastNameArr] = ownerName.trim().split(" ");
      const lastName = lastNameArr.join(" ") || "Unknown";
      const newSchoolId = crypto.randomUUID();

      await registerSchoolAdmin({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        school_id: newSchoolId,
        school_name: schoolName,
        address,
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Unable to connect to the server.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side (Gradient Background) */}
      <div className="hidden lg:flex flex-col w-[45%] bg-indigo-600 p-16 relative overflow-hidden text-white">
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <Link
            to="/"
            className="absolute top-0 left-0 hover:opacity-80 transition-opacity"
          >
            <img src={Logo} alt="Nexus Logo" className="h-8 w-auto" />
          </Link>

          <div className="mt-20">
            <h1 className="font-extrabold leading-tight tracking-tight text-5xl mb-6">
              See your school, <br />
              <span className="text-indigo-300">fully connected.</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed max-w-md">
              One platform for attendance, fees, exams, parent communication,
              and more built for African schools.
            </p>
          </div>
        </div>

        {/* Dashboard preview image */}
        <div className="relative w-full h-[45%] mt-10">
          <div className="w-full h-full rounded-t-2xl overflow-hidden  ">
            <img
              src={Dashboard}
              alt="Dashboard preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Right Side (Form Area) */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        <div className="max-w-2xl w-full mx-auto p-8 sm:p-12 lg:p-16">
          <div className="flex justify-start items-center mb-10 lg:hidden">
            <img src={SecondLogo} alt="Nexus Logo" className="h-8 w-auto" />
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Register your workspace
            </h2>
            <p className="text-slate-500 font-medium">
              Tell us about the institution and the person who will own its
              workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* SCHOOL DETAILS */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-sm font-bold text-slate-800 bg-slate-100 px-4 py-1.5 rounded-full">
                  School Details
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">
                    School name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Scholaris International School"
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">
                    School phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    required
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  School address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, state"
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                />
              </div>
            </div>

            {/* SCHOOL OWNER */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="text-sm font-bold text-slate-800 bg-slate-100 px-4 py-1.5 rounded-full">
                  School Owner
                </h3>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Owner full name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 text-sm font-bold mb-2">
                  Owner email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@school.com"
                  required
                  className="w-full border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-12 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    Use at least eight characters.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-2">
                    Confirm password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      className="w-full border border-slate-200 rounded-lg px-4 py-3 pr-12 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide py-3.5 px-10 rounded-lg transition-all shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
              <p className="mt-6 text-center text-sm font-medium text-slate-500">
                Already have a workspace?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Success Modal Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/80 backdrop-blur-sm">
            <div className="bg-white max-w-sm w-full rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 ring-8 ring-emerald-50/50">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Application Received!
              </h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                Thank you for registering your school. You will be contacted as
                soon as your application has been approved.
              </p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md active:scale-95"
              >
                Return Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
