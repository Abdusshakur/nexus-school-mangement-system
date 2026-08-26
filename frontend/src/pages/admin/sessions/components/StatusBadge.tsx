export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    active: {
      bg: "bg-emerald-100",
      color: "text-emerald-800",
      label: "Active",
    },
    locked: { bg: "bg-amber-100", color: "text-amber-800", label: "Locked" },
    archived: {
      bg: "bg-slate-100",
      color: "text-slate-500",
      label: "Archived",
    },
  };
  const s = styles[status] ?? styles.archived;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${s.bg} ${s.color}`}
    >
      {s.label}
    </span>
  );
}
