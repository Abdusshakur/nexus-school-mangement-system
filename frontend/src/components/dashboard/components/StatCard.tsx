import React from "react";
import { Link } from "react-router-dom";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;

  icon: LucideIcon;
  change?: string;
  positive?: boolean;
  colorName?: "indigo" | "violet" | "emerald" | "amber" | "red";
  to?: string;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  positive = true,
  colorName = "indigo",
  to,
}: StatCardProps) {
  const colors = colorMap[colorName] || colorMap.indigo;

  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center transition-transform group-hover:scale-105`}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {change && (
          <p className="text-xs mt-1.5 font-semibold flex items-center gap-1">
            <span className={positive ? "text-emerald-600" : "text-red-600"}>
              {change}
            </span>
          </p>
        )}
      </div>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-250 hover:shadow-lg hover:shadow-indigo-600/5 hover:border-indigo-300 group block hover:-translate-y-0.5 cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 transition-all duration-200 hover:shadow-md hover:border-slate-300">
      {content}
    </div>
  );
}
