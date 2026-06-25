import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react";
import Dashboard from "../../../assets/images/hero.png";
import Logo from "../../../assets/images/logo2.svg";
import SecondLogo from "../../../assets/images/logo.svg";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-inter">
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

        {/* Dashboard preview */}
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
              Welcome back
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm font-medium">
              Sign in to your Nexus account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            {/* forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember(!remember)}
                  className="w-4 h-4 text-indigo-500 bg-slate-50 border-slate-200 rounded focus:ring-indigo-500/30 focus:ring-2"
                />
                <span className="text-slate-600 text-xs font-medium">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-indigo-500 text-xs font-bold hover:text-indigo-600 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 mt-1 font-bold text-sm disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-slate-400 text-xs">or</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          <button
            onClick={() => navigate("/#pricing")}
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
