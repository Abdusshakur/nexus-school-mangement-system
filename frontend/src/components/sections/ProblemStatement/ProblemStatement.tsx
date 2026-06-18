import React from "react";
import {
  FileSpreadsheet,
  MessagesSquare,
  ClipboardType,
  MegaphoneOff,
  EyeOff,
  Coins,
} from "lucide-react";

export default function ProblemStatement() {
  const problems = [
    {
      id: "prob-1",
      icon: <FileSpreadsheet className="w-5 h-5 text-amber-600" />,
      text: "Scattered student records across notebooks and Excel sheets",
      bgColor: "bg-amber-50/50",
    },
    {
      id: "prob-2",
      icon: <MessagesSquare className="w-5 h-5 text-emerald-600" />,
      text: "Parent communication buried in WhatsApp groups",
      bgColor: "bg-emerald-50/50",
    },
    {
      id: "prob-3",
      icon: <ClipboardType className="w-5 h-5 text-blue-600" />,
      text: "Attendance tracked manually with paper registers",
      bgColor: "bg-blue-50/50",
    },
    {
      id: "prob-4",
      icon: <MegaphoneOff className="w-5 h-5 text-rose-600" />,
      text: "No central system for school announcements",
      bgColor: "bg-rose-50/50",
    },
    {
      id: "prob-5",
      icon: <EyeOff className="w-5 h-5 text-purple-600" />,
      text: "Zero visibility into school-wide performance data",
      bgColor: "bg-purple-50/50",
    },
    {
      id: "prob-6",
      icon: <Coins className="w-5 h-5 text-indigo-600" />,
      text: "Teacher and payroll records managed in silos",
      bgColor: "bg-indigo-50/50",
    },
  ];

  return (
    <section id="problem" className="py-10 md:py-28 bg-white font-inter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span
            id="problem-subtitle"
            className="inline-block text-xs sm:text-sm font-bold uppercase tracking-widest text-[#FB2C36] bg-red-50 px-4 py-1.5 rounded-full mb-4 text-shadow-red-100 "
          >
            The Problem
          </span>
          <h2
            id="problem-title"
            className="text-4xl sm:text-4xl font-extrabold text-slate-900"
          >
            Schools Shouldn't Run on <br /> WhatsApp and Spreadsheets
          </h2>
          <p
            id="problem-desc"
            className="mt-4 text-lg sm:text-lg text-slate-500 "
          >
            Most schools still juggle dozens of disconnected tools. The result?
            Missed messages, lost records, and exhausted administrators.
          </p>
        </div>

        {/* Problems Listing with map function*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((prob) => (
            <div
              key={prob.id}
              id={prob.id}
              className={`flex items-start gap-4 p-5 rounded-2xl border-2 border-gray-200 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:shadow-gray-100/40 hover:-translate-y-0.5 transition-all duration-300`}
            >
              <div className={`p-3 rounded-xl ${prob.bgColor} shrink-0`}>
                {prob.icon}
              </div>
              <p className="text-sm sm:text-base font-semibold text-gray-800 text-left leading-snug pt-1">
                {prob.text}
              </p>
            </div>
          ))}
        </div>

        <div
          id="nexus-way-card"
          className="mt-12 md:mt-24 p-8 md:p-12 rounded-3xl bg-indigo-500 text-white relative overflow-hidden shadow-xl shadow-indigo-500/10 text-center"
        >
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h3 className="text-indigo-200 uppercase font-semibold text-sm">
              The Nexus Way
            </h3>

            <h3 className="text-3xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              One platform. Every person. Every process.
            </h3>
            <p className="mt-4 text-base sm:text-base md:text-lg text-indigo-50">
              Nexus brings together every part of your school administration
              into a single, beautiful, easy-to-use platform so your staff can
              focus on what matters: education.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
