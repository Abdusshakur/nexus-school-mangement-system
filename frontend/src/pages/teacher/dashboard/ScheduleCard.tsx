interface ScheduleItem {
  subject: string;
  class: string;
  time: string;
  room: string;
  colorText: string;
  colorBg: string;
  colorSoft: string;
  colorBorder: string;
  colorRing: string;
  colorDivider: string;
}

interface ScheduleCardProps {
  item: ScheduleItem;
  index: number;
}

export function ScheduleCard({ item, index }: ScheduleCardProps) {
  // crude "current" detection for demo — highlight the 10:00 class
  const isCurrent = index === 1;

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
        isCurrent
          ? `${item.colorBorder} ${item.colorSoft} ring-2 ${item.colorRing}`
          : "border-slate-100 bg-white"
      }`}
    >
      <div className="text-center w-20 shrink-0">
        <p className={`text-xs font-semibold ${item.colorText}`}>
          {item.time.split(" - ")[0]}
        </p>
        {/* <p className="text-xs text-slate-400">{item.time.split(" - ")[1]}</p> */}
      </div>
      <div className={`w-px h-10 ${item.colorDivider}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.subject}</p>
        <p className="text-xs mt-0.5 text-slate-500">
          {item.class} · {item.room}
        </p>
      </div>
      {isCurrent && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold text-white ${item.colorBg}`}
        >
          Now
        </span>
      )}
    </div>
  );
}
