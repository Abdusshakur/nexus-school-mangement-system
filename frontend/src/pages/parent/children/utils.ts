export function seededRand(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return (Math.abs(h) % 1000) / 1000;
}

export function recentAttendance(childName: string) {
  const days: Array<{ date: string; status: "Present" | "Absent" | "Late" }> = [];
  const base = new Date("2026-08-15");
  for (let i = 4; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const r = seededRand(childName + d.toISOString().slice(0, 10));
    const status = r > 0.9 ? "Absent" : r > 0.82 ? "Late" : "Present";
    days.push({ date: d.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" }), status });
  }
  return days;
}

export const ATTENDANCE_STYLE: Record<string, { bg: string; text: string }> = {
  Present: { bg: "bg-emerald-100", text: "text-emerald-800" },
  Absent:  { bg: "bg-red-100", text: "text-red-800" },
  Late:    { bg: "bg-amber-100", text: "text-amber-800" },
};

export const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  High:   { bg: "bg-red-100", text: "text-red-800" },
  Medium: { bg: "bg-amber-100", text: "text-amber-800" },
  Low:    { bg: "bg-indigo-50", text: "text-indigo-700" },
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}
