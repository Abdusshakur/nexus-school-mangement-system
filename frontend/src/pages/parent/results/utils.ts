export function getGradeStyles(grade: string): { bg: string; text: string } {
  const g = (grade || "").toUpperCase();
  if (g.startsWith("A")) return { bg: "bg-emerald-100", text: "text-emerald-800" };
  if (g.startsWith("B")) return { bg: "bg-emerald-50", text: "text-emerald-700" };
  if (g.startsWith("C")) return { bg: "bg-blue-100", text: "text-blue-800" };
  if (g.startsWith("D")) return { bg: "bg-indigo-50", text: "text-indigo-700" };
  if (g.startsWith("E")) return { bg: "bg-amber-100", text: "text-amber-800" };
  if (g.startsWith("F") || g.includes("FAIL")) return { bg: "bg-red-100", text: "text-red-800" };
  return { bg: "bg-slate-100", text: "text-slate-800" };
}
