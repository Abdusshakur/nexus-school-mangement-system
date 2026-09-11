import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useOnboardingStore } from "../../../store/onboarding.store";
import { StepOne } from "./components/StepOne";
import { StepTwo } from "./components/StepTwo";
import { StepThree } from "./components/StepThree";
import { Building2, MapPin, ShieldCheck, CheckCircle2 } from "lucide-react";
import Dashboard from "../../../assets/images/hero.png";
import Logo from "../../../assets/images/logo2.svg";
import SecondLogo from "../../../assets/images/logo.svg";

export default function SchoolOnboardingPage() {
  const { currentStep, reset } = useOnboardingStore();

  // Reset store on initial mount in case of abandoned drafts
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    { num: 1, title: "School", icon: Building2 },
    { num: 2, title: "Location", icon: MapPin },
    { num: 3, title: "Admin", icon: ShieldCheck },
  ];

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
          <div className="w-full h-full rounded-t-2xl overflow-hidden shadow-2xl">
            <img
              src={Dashboard}
              alt="Dashboard preview"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>

      {/* Right Side (Form Area) */}
      <div className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50">
        <div className="max-w-2xl w-full mx-auto p-8 sm:p-12 lg:p-16">
          <div className="flex justify-between items-center mb-10">
            <div className="lg:hidden">
              <img src={SecondLogo} alt="Nexus Logo" className="h-8 w-auto" />
            </div>
            <div className="text-sm font-medium text-slate-500 hidden lg:block ml-auto">
              Already registered? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Onboard your school
            </h2>
            <p className="text-slate-500 font-medium">
              Complete the steps below to setup your workspace and administrator account.
            </p>
          </div>

          {/* Horizontal Progress Tracker */}
          <div className="mb-12 px-4 sm:px-8">
            <div className="relative flex items-center justify-between">
              {/* Background Line */}
              <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1 bg-slate-100 rounded-full z-0 overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-700 ease-in-out rounded-full"
                  style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
              </div>

              {steps.map((step) => {
                const Icon = step.icon;
                const isCompleted = currentStep > step.num;
                const isCurrent = currentStep === step.num;

                return (
                  <div key={step.num} className="relative z-10 flex flex-col items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 ease-in-out bg-white ${
                        isCompleted
                          ? "border-indigo-600 text-indigo-600 shadow-sm"
                          : isCurrent
                          ? "border-indigo-600 text-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.15)] ring-4 ring-white"
                          : "border-slate-200 text-slate-300"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} strokeWidth={3} className="text-indigo-600" /> : <Icon size={18} strokeWidth={isCurrent ? 2.5 : 2} />}
                    </div>
                    <span 
                      className={`absolute top-12 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                        isCurrent 
                          ? "text-indigo-700" 
                          : isCompleted 
                            ? "text-slate-700" 
                            : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10">
            {currentStep === 1 && <StepOne />}
            {currentStep === 2 && <StepTwo />}
            {currentStep === 3 && <StepThree />}
          </div>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500 lg:hidden">
            Already registered? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Sign in</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
