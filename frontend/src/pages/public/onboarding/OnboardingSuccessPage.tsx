import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function OnboardingSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-10 shadow-xl text-center animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <CheckCircle size={40} className="animate-in zoom-in duration-500 delay-300" />
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Application Received!
        </h1>

        <p className="text-slate-600 mb-8 leading-relaxed">
          Your school's application has been successfully submitted. The team will review your details shortly.
          <br /><br />
          You will receive an email once your application is approved and your workspace is ready.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full px-6 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
