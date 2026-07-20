export const CLASSES = [
  { id: "jss1", name: "JSS 1", level: "junior" as const },
  { id: "jss2", name: "JSS 2", level: "junior" as const },
  { id: "jss3", name: "JSS 3", level: "junior" as const },
  { id: "ss1", name: "SS 1", level: "senior" as const },
  { id: "ss2", name: "SS 2", level: "senior" as const },
  { id: "ss3", name: "SS 3", level: "senior" as const },
];

export const JUNIOR_SUBJECTS = [
  "Mathematics",
  "English Studies",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Agricultural Science",
  "Business Studies",
  "Home Economics",
  "Physical & Health Education",
  "Computer Studies",
];

export const SENIOR_SUBJECTS = [
  "Mathematics",
  "English Language",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Geography",
  "Further Mathematics",
  "Economics",
  "Government",
  "Literature-in-English",
  "Civic Education",
  "Financial Accounting",
];

export const ALL_SUBJECTS = Array.from(
  new Set([...JUNIOR_SUBJECTS, ...SENIOR_SUBJECTS]),
);

export const DEPARTMENTS = [
  "Sciences",
  "Mathematics",
  "Languages",
  "Social Sciences",
  "Arts & Humanities",
  "Technical",
];

export const QUALIFICATIONS = [
  "B.Ed. (Education)",
  "B.Sc. + PGDE",
  "B.A. + PGDE",
  "NCE",
  "M.Ed.",
  "M.Sc. + PGDE",
  "Ph.D.",
  "Other",
];

export function classColor(level: "junior" | "senior") {
  return level === "junior"
    ? { bg: "bg-amber-100", text: "text-amber-850" }
    : { bg: "bg-indigo-100", text: "text-indigo-700" };
}

export function getSubjectsForClasses(classIds: string[]): string[] {
  const hasJunior = classIds.some(
    (id) => CLASSES.find((c) => c.id === id)?.level === "junior",
  );
  const hasSenior = classIds.some(
    (id) => CLASSES.find((c) => c.id === id)?.level === "senior",
  );
  if (hasJunior && hasSenior) return ALL_SUBJECTS;
  if (hasJunior) return JUNIOR_SUBJECTS;
  if (hasSenior) return SENIOR_SUBJECTS;
  return ALL_SUBJECTS;
}
