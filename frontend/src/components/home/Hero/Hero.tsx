import { ArrowRight, Star } from "lucide-react";
import HeroImg from "../../../assets/images/hero.png";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative pt-32 pb-10 md:pt-40 md:pb-28 overflow-hidden  font-inter"
    >
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-100/20 rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <div
              className="inline-flex items-center gap-1.5 bg-indigo-50/80 border border-indigo-100 text-indigo-600 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6 shadow-sm"
              id="hero-trust-badge"
            >
              <Star className="w-4 h-4 fill-indigo-500 text-indigo-500" />
              <span>Trusted by 400+ schools across Africa</span>
            </div>

            <h1
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-[54px] lg:text-5xl xl:text-[54px] font-extrabold tracking-tight text-slate-900 leading-tight"
            >
              Run Your School
              <br className="hidden sm:inline text-dark-text-100" />
              <span className="text-indigo-500 relative inline-block mt-1">
                From One Dashboard
              </span>
            </h1>

            <p
              id="hero-description"
              className="mt-6 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl"
            >
              Manage students, teachers, parents, attendance, and announcements
              from a single platform designed to simplify school administration.
            </p>

            <div
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
              id="hero-actions"
            >
              <a
                href="#pricing"
                id="hero-btn-primary"
                className="group flex items-center justify-center gap-2 w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600  text-white px-7 py-3.5 rounded-xl font-semibold shadow-lg  transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="#contact"
                id="hero-btn-secondary"
                className="flex items-center justify-center w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 active:scale-98 px-7 py-3.5 rounded-xl font-semibold transition-all duration-200"
              >
                Request Demo
              </a>
            </div>

            {/* Social Proof rating and Avatars */}
            <div
              className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-8 w-full"
              id="hero-rating-block"
            >
              <div className="flex -space-x-3">
                <span className="w-9 h-9 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-xs font-bold ">
                  P
                </span>
                <span className="w-9 h-9 rounded-full border-2 bg-green-500 text-white flex items-center justify-center text-xs font-bold ">
                  T
                </span>
                <span className="w-9 h-9 rounded-full border-2 border-white bg-orange-500 text-white flex items-center justify-center text-xs font-bold ">
                  S
                </span>
                <span className="w-9 h-9 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-xs font-bold ">
                  A
                </span>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm text-[#1D293D] font-semibold ">
                    Loved by 400+ schools
                  </span>
                  <div className="flex">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                    <span className="ml-1 text-xs text-[#90A1B9]">
                      4.9 / 5 rating
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 w-full flex items-center justify-center">
            <div
              className="w-full max-w-[620px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden transform hover:scale-[1.01] transition-transform duration-300"
              id="dashboard-browser-window"
            >
              <img
                src={HeroImg}
                alt="Nexus School Admin Dashboard Preview"
                className="w-full h-auto object-cover block"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
