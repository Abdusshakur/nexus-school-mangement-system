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
    <div className="bg-white rounded-xl p-5 flex items-start gap-4 transition-shadow hover:shadow-md border border-slate-200">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="font-bold mt-0.5 text-[26px] leading-none text-slate-900">
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1 text-slate-400">{sub}</p>
        )}
      </div>
    </div>
  );
}
