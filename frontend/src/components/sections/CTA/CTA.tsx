import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section
      id="cta"
      className="py-20 md:py-20 bg-white relative overflow-hidden font-inter"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          id="cta-main-card"
          className="bg-indigo-500 rounded-3xl p-8 sm:p-12 md:p-16 text-white text-center relative overflow-hidden shadow-2xl shadow-indigo-500/20"
        >
          <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-600 rounded-full blur-3xl opacity-60 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Modernize <br className="hidden sm:inline" /> Your
              School?
            </h2>

            <p className="mt-5 text-sm sm:text-base md:text-lg text-indigo-50 font-medium leading-relaxed">
              Join 400+ schools already running smarter with Nexus. Get set up
              in under 48 hours we handle everything.
            </p>

            {/* CTA action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <a
                href="#pricing"
                id="cta-btn-get-started"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-white hover:bg-indigo-50 text-indigo-500 font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 active:scale-98"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#"
                id="cta-btn-request-demo"
                className="flex items-center justify-center w-full sm:w-auto bg-indigo-600/80 hover:bg-indigo-600 border border-slate-300 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 active:scale-98"
              >
                Request Custom Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
