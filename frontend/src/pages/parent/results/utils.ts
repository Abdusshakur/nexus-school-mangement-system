export function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getGrade(total: number): {
  grade: string;
  bg: string;
  text: string;
  remark: string;
} {
  if (total >= 75)
    return {
      grade: "A1",
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      remark: "Excellent",
    };
  if (total >= 70)
    return {
      grade: "B2",
      bg: "bg-emerald-100",
      text: "text-emerald-800",
      remark: "Very Good",
    };
  if (total >= 65)
    return {
      grade: "B3",
      bg: "bg-blue-100",
      text: "text-blue-900",
      remark: "Good",
    };
  if (total >= 60)
    return {
      grade: "C4",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      remark: "Credit",
    };
  if (total >= 55)
    return {
      grade: "C5",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      remark: "Credit",
    };
  if (total >= 50)
    return {
      grade: "C6",
      bg: "bg-amber-100",
      text: "text-amber-800",
      remark: "Credit",
    };
  if (total >= 45)
    return {
      grade: "D7",
      bg: "bg-amber-100",
      text: "text-amber-800",
      remark: "Pass",
    };
  if (total >= 40)
    return {
      grade: "E8",
      bg: "bg-red-100",
      text: "text-red-800",
      remark: "Pass",
    };
  return {
    grade: "F9",
    bg: "bg-red-100",
    text: "text-red-900",
    remark: "Fail",
  };
}

export function genResult(childName: string, subject: string, term: string) {
  const seed = hash(`${childName}-${subject}-${term}`);
  const ca = (seed % 12) + 18; // 18–29
  const exam = (seed % 30) + 40; // 40–69
  const total = ca + exam;
  return { ca, exam, total, ...getGrade(total) };
}

export function getSubjectsForClass(classId: string): string[] {
  if (classId.startsWith("JSS")) {
    return [
      "English Language",
      "Mathematics",
      "Basic Science",
      "Social Studies",
      "Agricultural Science",
      "Computer Studies",
      "Civic Education",
      "French Language",
    ];
  }
  return [
    "English Language",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Further Mathematics",
    "Economics",
  ];
}
