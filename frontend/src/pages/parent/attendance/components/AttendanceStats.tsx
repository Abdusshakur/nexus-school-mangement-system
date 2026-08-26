import { CalendarCheck, UserCheck, UserX, Clock } from "lucide-react";

interface AttendanceStatsProps {
  present: number;
  absent: number;
  late: number;
  totalDays: number;
  recordsLength: number;
}

export function AttendanceStats({
  present,
  absent,
  late,
  totalDays,
  recordsLength,
}: AttendanceStatsProps) {
  const rate = Math.round(((totalDays - 2) / totalDays) * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: "Attendance Rate",
          value: `${rate}%`,
          icon: CalendarCheck,
          iconColor: "text-indigo-500",
          iconBg: "bg-indigo-50",
        },
        {
          label: "Days Present",
          value: present + (totalDays - recordsLength),
          icon: UserCheck,
          iconColor: "text-emerald-500",
          iconBg: "bg-emerald-100",
        },
        {
          label: "Days Absent",
          value: absent + 1,
          icon: UserX,
          iconColor: "text-red-500",
          iconBg: "bg-red-100",
        },
        {
          label: "Late Arrivals",
          value: late,
          icon: Clock,
          iconColor: "text-amber-500",
          iconBg: "bg-amber-100",
        },
      ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
        <div
          key={label}
          className="bg-white rounded-xl p-5 flex items-start gap-4 border border-slate-200"
        >
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}
          >
            <Icon size={20} className={iconColor} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="font-bold mt-0.5 text-2xl text-slate-900">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
