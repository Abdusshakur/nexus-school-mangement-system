import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  iconColor: string;
  iconBg: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  iconColor,
  iconBg,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-5 flex items-start gap-2.5 sm:gap-4 transition-shadow hover:shadow-md border border-slate-200">
      <div
        className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-slate-500 truncate">{label}</p>
        <p className="mt-0.5 sm:mt-1 font-bold text-lg sm:text-[26px] leading-none text-slate-900 truncate">
          {value}
        </p>
        {sub && <p className="text-[10px] sm:text-xs mt-1 text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  );
}
