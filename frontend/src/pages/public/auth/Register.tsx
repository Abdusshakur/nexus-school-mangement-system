import React, { useState } from "react";

import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Dashboard from "../../../../src/assets/images/hero.png";
import Logo from "../../../../src/assets/images/logo2.svg";
import SecondLogo from "../../../../src/assets/images/logo.svg";
import { registerSchoolAdmin } from "../../../api/auth";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schoolName, setSchoolName] = useState("");
  const [motto, setMotto] = useState("");
  const [address, setAddress] = useState("");
  const [principalName, setPrincipalName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    e.preventDefault();

    if (!email || !password || !principalName || !schoolName) return;

    setIsSubmitting(true);
    try {
      const nameParts = principalName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const newSchoolId = crypto.randomUUID(); // Auto-generate UUID for the new school
      await registerSchoolAdmin({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        school_id: newSchoolId,
        school_name: schoolName,
        motto,
        address,
      });
      toast.success("School Registered successfully! Please log in.");
      navigate("/login");
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
    <div className="min-h-screen bg-slate-50 flex ">
      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-indigo-600 p-14 relative overflow-hidden">
        <Link
          to="/"
          onClick={() => navigate("/")}
          className="relative flex items-center mb-2 cursor-pointer group"
        >
          <div className=" rounded-xl backdrop-blur flex items-center justify-center ">
            <img src={Logo} alt="Nexus Logo" />
          </div>
        </Link>

        <div className="relative">
          <p className="text-indigo-200 text-xs tracking-wider uppercase mb-4 font-bold">
            SCHOOL MANAGEMENT SIMPLIFIED
          </p>
          <h1 className="text-white mb-6 font-extrabold leading-none tracking-tight text-4xl xl:text-5xl">
            Run Your School
            <br />
            From One Dashboard
          </h1>
          <p className="text-indigo-100 text-base xl:text-xl leading-relaxed max-w-md">
            Manage students, teachers, parents, attendance and announcements
            from one integrated, high-speed platform.
          </p>

          <div className="flex gap-10 mt-10">
            {[
              { value: "400+", label: "Schools" },
              { value: "120K+", label: "Students" },
              { value: "4.9 ", label: "Rating" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white text-2xl font-extrabold">{value} </p>
                <p className="text-indigo-200 text-xs mt-0.5 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview image*/}
        <div className="relative scale-90 origin-bottom-left -mb-6  overflow-hidden">
          <img src={Dashboard} alt="Dashboard preview" />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm transition-colors mb-4 self-start md: right-16"
        >
          <ArrowLeft size={16} /> Back to home
        </button>
        {/* logo to appear on mobile screen */}
        <div
          onClick={() => navigate("/")}
          className="lg:hidden flex items-center justify-center gap-2.5 mb-8 cursor-pointer"
        >
          <img src={SecondLogo} alt="Nexus Logo" />
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-slate-900 text-2xl lg:text-4xl font-extrabold tracking-tight mb-1">
              Register your School
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm font-medium">
              Create an admin account to set up your Nexus workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                Name of School
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nexus Academy"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                Name of Principal / Director
              </label>
              <input
                type="text"
                value={principalName}
                onChange={(e) => setPrincipalName(e.target.value)}
                placeholder="Dr. John Doe"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 801 234 5678"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="principal@yourschool.edu"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                School Motto (Optional)
              </label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="Knowledge is Power"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-semibold mb-1.5">
                School Address (Optional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Education Lane, Lagos"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-slate-700 text-sm font-semibold">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-800 text-sm placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-slate-50 focus:bg-white"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-sm shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "Registering..." : "Create Workspace"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have a workspace?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
            >
              Sign in
            </Link>
          </p>

          <button
            onClick={() => navigate("/request-demo")}
            className="w-full border border-slate-200 text-slate-600 hover:border-indigo-500/30 hover:text-indigo-500 py-3 rounded-xl transition-all text-sm font-semibold"
          >
            Request a Demo
          </button>

          <p className="text-center text-slate-400 text-sm mt-6">
            Need help?{" "}
            <a
              href="mailto:hello@nexusschool.io"
              className="text-indigo-500 hover:underline font-semibold"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
