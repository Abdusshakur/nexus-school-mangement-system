import { type LinkedParent } from "../../../api/students";

export interface Student {
  id: string;
  name: string;
  grade: string;
  gender: string;
  dob: string;
  phone: string;
  email: string;
  address: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentsList?: LinkedParent[];
  status: "Active" | "Inactive" | string;
  joined: string;
  initials?: string;
  avatarColor?: string;
  avatar?: string;
  avatarBg?: string;
}


export const SESSIONS = [
  "2025-26 Term 3",
  "2025-26 Term 2",
  "2025-26 Term 1",
  "2024-25 Term 3",
  "2024-25 Term 2",
  "2024-25 Term 1",
];

// --- MOCK DATA GENERATION FOR TABS ---

export const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  SS3: [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "English Language",
    "Further Maths",
    "Literature",
  ],
  SS2: [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "English Language",
    "Geography",
    "Literature",
  ],
  SS1: [
    "Biology",
    "Chemistry",
    "Physics",
    "Mathematics",
    "English Language",
    "Agricultural Science",
    "Literature",
  ],
  JSS3: [
    "Basic Science",
    "Mathematics",
    "English Language",
    "Social Studies",
    "Christian Religious Studies",
    "Civic Education",
    "French",
  ],
  JSS2: [
    "Basic Science",
    "Mathematics",
    "English Language",
    "Social Studies",
    "Christian Religious Studies",
    "Civic Education",
    "French",
  ],
};

export function seedRand(
  seed: number,
  session: string,
  subject: string,
): number {
  const str = `${seed}${session}${subject}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function generateResults(
  studentId: string,
  subjects: string[],
  session: string,
) {
  const seed = parseInt(studentId.replace(/[^\d]/g, ""), 10) || 1;
  return subjects.map((subject) => {
    const r = (col: number) =>
      10 + (seedRand(seed + col, session, subject) % 11); // 10-20
    const ca1 = r(1);
    const ca2 = r(2);
    const ca3 = r(3);
    const mid = 40 + (seedRand(seed + 4, session, subject) % 31); // 40-70
    const fin = 40 + (seedRand(seed + 5, session, subject) % 31);
    const total = ca1 + ca2 + ca3 + mid + fin;
    const grade_ =
      total >= 180
        ? "A+"
        : total >= 165
          ? "A"
          : total >= 150
            ? "B+"
            : total >= 135
              ? "B"
              : total >= 120
                ? "C"
                : total >= 100
                  ? "D"
                  : "F";
    const remark =
      total >= 165
        ? "Excellent"
        : total >= 150
          ? "Very Good"
          : total >= 135
            ? "Good"
            : total >= 120
              ? "Average"
              : total >= 100
                ? "Below Average"
                : "Fail";
    return { subject, ca1, ca2, ca3, mid, fin, total, grade: grade_, remark };
  });
}

export function getGradeColor(g: string) {
  if (g === "A+" || g === "A") return "bg-indigo-100 text-indigo-800";
  if (g === "B+" || g === "B") return "bg-indigo-50 text-indigo-700";
  if (g === "C") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

export function generateAttendance(studentId: string, session: string) {
  const seed = parseInt(studentId.replace(/[^\d]/g, ""), 10) || 1;
  const days: {
    date: string;
    week: number;
    dow: number;
    status: "P" | "A" | "L" | "H";
  }[] = [];
  const baseWeek = session.includes("Term 3")
    ? 20
    : session.includes("Term 2")
      ? 6
      : 32;
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 5; d++) {
      const r = seedRand(seed + w * 10 + d, session, "att") % 100;
      const status: "P" | "A" | "L" | "H" =
        d === 4 && w % 3 === 2 ? "H" : r < 5 ? "A" : r < 12 ? "L" : "P";
      days.push({
        date: `W${baseWeek + w} D${d + 1}`,
        week: w,
        dow: d,
        status,
      });
    }
  }
  const present = days.filter((d) => d.status === "P").length;
  const late = days.filter((d) => d.status === "L").length;
  const absent = days.filter((d) => d.status === "A").length;
  const holiday = days.filter((d) => d.status === "H").length;
  const total = days.length - holiday;
  const rate = Math.round(((present + late) / total) * 100);
  return { days, present, late, absent, holiday, total, rate };
}

export const COURSE_TEACHERS: Record<
  string,
  { name: string; email: string; colorClass: string; bgClass: string }
> = {
  Biology: {
    name: "Mr. Ade Okafor",
    email: "teacher@westwood.edu",
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
  Chemistry: {
    name: "Mr. Ahmed Al-Rashid",
    email: "a.alrashid@westwood.edu",
    colorClass: "text-pink-500",
    bgClass: "bg-pink-50",
  },
  Physics: {
    name: "Ms. Priyanka Sharma",
    email: "p.sharma@westwood.edu",
    colorClass: "text-amber-500",
    bgClass: "bg-amber-50",
  },
  Mathematics: {
    name: "Dr. Eleanor Kim",
    email: "e.kim@westwood.edu",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
  "English Language": {
    name: "Mr. David Okafor",
    email: "d.okafor@westwood.edu",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
  "Further Maths": {
    name: "Dr. Eleanor Kim",
    email: "e.kim@westwood.edu",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
  Literature: {
    name: "Mr. David Okafor",
    email: "d.okafor@westwood.edu",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
  Geography: {
    name: "Mr. James Osei",
    email: "j.osei@westwood.edu",
    colorClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  "Agricultural Science": {
    name: "Ms. Laura Nakamura",
    email: "l.nakamura@westwood.edu",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-50",
  },
  "Basic Science": {
    name: "Mr. Ade Okafor",
    email: "teacher@westwood.edu",
    colorClass: "text-indigo-600",
    bgClass: "bg-indigo-50",
  },
  "Social Studies": {
    name: "Mr. James Osei",
    email: "j.osei@westwood.edu",
    colorClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  "Christian Religious Studies": {
    name: "Ms. Laura Nakamura",
    email: "l.nakamura@westwood.edu",
    colorClass: "text-violet-500",
    bgClass: "bg-violet-50",
  },
  "Civic Education": {
    name: "Mr. James Osei",
    email: "j.osei@westwood.edu",
    colorClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  French: {
    name: "Mr. David Okafor",
    email: "d.okafor@westwood.edu",
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-50",
  },
};
