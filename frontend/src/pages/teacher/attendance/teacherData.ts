export const NIGERIAN_CLASSES = [
  { id: "JSS1", name: "JSS 1" },
  { id: "JSS2", name: "JSS 2" },
  { id: "JSS3A", name: "JSS 3A" },
  { id: "SS1SCI", name: "SS 1 Science" },
  { id: "SS2SCI", name: "SS 2 Science" },
  { id: "SS3SCI", name: "SS 3 Science" },
];

export const MALE_FIRST = [
  "Emeka", "Chidi", "Kolade", "Femi", "Tunde", "Yemi", "Ahmed", "Musa", "Uche",
  "Adewale", "Kola", "Dele", "Ibrahim", "Rasheed", "Babatunde", "Gbenga", "Seun", "Kunle"
];

export const FEMALE_FIRST = [
  "Ngozi", "Chioma", "Amaka", "Funke", "Temi", "Bimpe", "Sade", "Aisha", "Fatima",
  "Adaeze", "Nneka", "Blessing", "Toyin", "Amina", "Halima", "Yetunde", "Bukola", "Chiamaka"
];

export const LAST_NAMES = [
  "Okafor", "Adeyemi", "Nwosu", "Ibrahim", "Bello", "Eze", "Obi", "Aliyu", "Musa",
  "Adebayo", "Okonkwo", "Hassan", "Mohammed", "Abubakar", "Adeleke", "Oyelaran",
  "Adeola", "Babatunde", "Nwofor", "Olawale"
];

export const AVATAR_COLORS = [
  "bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-red-500", "bg-purple-500",
  "bg-pink-500", "bg-teal-600", "bg-sky-500", "bg-teal-500", "bg-orange-500"
];

export function seedRng(seed: number) {
  let s = seed;
  return () => {
    s = Math.imul(48271, s) | 0;
    return (s >>> 0) / 0xffffffff;
  };
}

export interface RollStudent {
  id: string;
  name: string;
  admNo: string;
  initials: string;
  color: string;
}

export function generateStudents(classId: string, count = 28): RollStudent[] {
  const seed = classId.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 7);
  const rng = seedRng(seed);
  return Array.from({ length: count }, (_, i) => {
    const isFemale = rng() > 0.5;
    const first = isFemale
      ? FEMALE_FIRST[Math.floor(rng() * FEMALE_FIRST.length)]
      : MALE_FIRST[Math.floor(rng() * MALE_FIRST.length)];
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    return {
      id: `${classId}-${String(i + 1).padStart(3, "0")}`,
      name: `${first} ${last}`,
      admNo: `NEX-2026-${String(i + 1).padStart(4, "0")}`,
      initials: `${first[0]}${last[0]}`,
      color: AVATAR_COLORS[i % AVATAR_COLORS.length],
    };
  });
}
