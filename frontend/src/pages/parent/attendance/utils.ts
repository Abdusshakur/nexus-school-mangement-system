export type AttStatus = "Present" | "Absent" | "Late";

export function seededRand(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return (Math.abs(h) % 10000) / 10000;
}

export function buildAttendanceRecords(childName: string) {
  const records: Array<{ date: string; status: AttStatus; checkIn: string }> = [];
  const base = new Date("2026-08-15");
  for (let i = 0; i < 20 && records.length < 10; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const seed = childName + d.toISOString().slice(0, 10);
    const r = seededRand(seed);
    const status: AttStatus = r > 0.91 ? "Absent" : r > 0.84 ? "Late" : "Present";
    const baseHour = status === "Late" ? 8 : 7;
    const baseMin =
      status === "Late"
        ? Math.floor(seededRand(seed + "m") * 30)
        : 30 + Math.floor(seededRand(seed + "m") * 15);
    const checkIn =
      status === "Absent"
        ? "—"
        : `${String(baseHour).padStart(2, "0")}:${String(baseMin).padStart(2, "0")} AM`;
    records.push({
      date: d.toLocaleDateString("en-NG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      status,
      checkIn,
    });
  }
  return records;
}

export const STATUS_STYLES: Record<AttStatus, { bg: string; text: string; dot: string }> = {
  Present: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  Absent: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
  Late: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
};
