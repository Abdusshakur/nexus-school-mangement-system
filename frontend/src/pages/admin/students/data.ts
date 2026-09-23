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

