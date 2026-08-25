export const THEME_COLORS = [
  { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300" },
  { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-300" },
  { bg: "bg-violet-100", text: "text-violet-900", border: "border-violet-300" },
  { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300" },
  { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300" },
  { bg: "bg-orange-50", text: "text-orange-900", border: "border-orange-300" },
  { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300" },
  { bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-300" },
  { bg: "bg-sky-100", text: "text-sky-900", border: "border-sky-300" },
  { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" },
  { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" },
];

export function getSubjectColors(subjectName: string) {
  if (!subjectName) {
    return { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" };
  }
  
  let hash = 0;
  for (let i = 0; i < subjectName.length; i++) {
    hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % THEME_COLORS.length;
  
  return THEME_COLORS[index];
}
