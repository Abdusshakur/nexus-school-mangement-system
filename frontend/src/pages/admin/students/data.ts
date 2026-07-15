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
  status: string;
  joined: string;
  avatar: string;
  avatarBg: string;
}

export const allStudents: Student[] = [
  {
    id: "S001",
    name: "Amelia Johnson",
    grade: "Grade 10",
    gender: "Female",
    dob: "2009-03-15",
    phone: "+1 555 0101",
    email: "amelia.j@westwood.edu",
    address: "42 Maple Ave, Springfield",
    parentName: "Robert Johnson",
    parentPhone: "+1 555 0100",
    status: "Active",
    joined: "2022-09-01",
    avatar: "AJ",
    avatarBg: "bg-indigo-500",
  },
  {
    id: "S002",
    name: "Marcus Williams",
    grade: "Grade 8",
    gender: "Male",
    dob: "2011-07-22",
    phone: "+1 555 0102",
    email: "marcus.w@westwood.edu",
    address: "88 Oak Street, Springfield",
    parentName: "Denise Williams",
    parentPhone: "+1 555 0103",
    status: "Active",
    joined: "2023-09-01",
    avatar: "MW",
    avatarBg: "bg-indigo-500",
  },
  {
    id: "S003",
    name: "Sofia Rodriguez",
    grade: "Grade 11",
    gender: "Female",
    dob: "2008-11-04",
    phone: "+1 555 0104",
    email: "sofia.r@westwood.edu",
    address: "15 Birch Lane, Springfield",
    parentName: "Carlos Rodriguez",
    parentPhone: "+1 555 0105",
    status: "Active",
    joined: "2021-09-01",
    avatar: "SR",
    avatarBg: "bg-amber-500",
  },
  {
    id: "S004",
    name: "Ethan Chen",
    grade: "Grade 9",
    gender: "Male",
    dob: "2010-05-30",
    phone: "+1 555 0106",
    email: "ethan.c@westwood.edu",
    address: "7 Pine Road, Springfield",
    parentName: "Li Chen",
    parentPhone: "+1 555 0107",
    status: "Inactive",
    joined: "2022-09-01",
    avatar: "EC",
    avatarBg: "bg-rose-500",
  },
  {
    id: "S005",
    name: "Priya Patel",
    grade: "Grade 12",
    gender: "Female",
    dob: "2007-08-19",
    phone: "+1 555 0108",
    email: "priya.p@westwood.edu",
    address: "99 Cedar Blvd, Springfield",
    parentName: "Raj Patel",
    parentPhone: "+1 555 0109",
    status: "Active",
    joined: "2020-09-01",
    avatar: "PP",
    avatarBg: "bg-purple-500",
  },
  {
    id: "S006",
    name: "James Thompson",
    grade: "Grade 7",
    gender: "Male",
    dob: "2012-02-11",
    phone: "+1 555 0110",
    email: "james.t@westwood.edu",
    address: "33 Elm Way, Springfield",
    parentName: "Sarah Thompson",
    parentPhone: "+1 555 0111",
    status: "Active",
    joined: "2024-09-01",
    avatar: "JT",
    avatarBg: "bg-pink-500",
  },
  {
    id: "S007",
    name: "Layla Hassan",
    grade: "Grade 10",
    gender: "Female",
    dob: "2009-12-28",
    phone: "+1 555 0112",
    email: "layla.h@westwood.edu",
    address: "21 Willow Dr, Springfield",
    parentName: "Omar Hassan",
    parentPhone: "+1 555 0113",
    status: "Active",
    joined: "2022-09-01",
    avatar: "LH",
    avatarBg: "bg-sky-500",
  },
  {
    id: "S008",
    name: "Noah Anderson",
    grade: "Grade 8",
    gender: "Male",
    dob: "2011-04-07",
    phone: "+1 555 0114",
    email: "noah.a@westwood.edu",
    address: "55 Aspen Court, Springfield",
    parentName: "Claire Anderson",
    parentPhone: "+1 555 0115",
    status: "Active",
    joined: "2023-09-01",
    avatar: "NA",
    avatarBg: "bg-indigo-500",
  },
];


// ─── Data ─────────────────────────────────────────────────────────────────────

export const STUDENT_DB: Record<string, {
  id: string; name: string; initials: string; avatarColor: string;
  grade: string; gender: string; dob: string; phone: string;
  email: string; address: string; parentName: string; parentPhone: string;
  parentEmail: string; status: "Active" | "Inactive"; joined: string;
  bloodGroup: string; nationality: string;
}> = {
  S001: { id: "S001", name: "Amelia Johnson", initials: "AJ", avatarColor: "bg-indigo-500", grade: "SS2", gender: "Female", dob: "2009-03-15", phone: "+1 555 0101", email: "amelia.j@westwood.edu", address: "42 Maple Ave, Springfield", parentName: "Robert Johnson", parentPhone: "+1 555 0100", parentEmail: "r.johnson@email.com", status: "Active", joined: "2022-09-01", bloodGroup: "O+", nationality: "American" },
  S002: { id: "S002", name: "Marcus Williams", initials: "MW", avatarColor: "bg-indigo-500", grade: "SS1", gender: "Male", dob: "2011-07-22", phone: "+1 555 0102", email: "marcus.w@westwood.edu", address: "88 Oak Street, Springfield", parentName: "Denise Williams", parentPhone: "+1 555 0103", parentEmail: "d.williams@email.com", status: "Active", joined: "2023-09-01", bloodGroup: "A+", nationality: "American" },
  S003: { id: "S003", name: "Sofia Rodriguez", initials: "SR", avatarColor: "bg-amber-500", grade: "SS2", gender: "Female", dob: "2008-11-04", phone: "+1 555 0104", email: "sofia.r@westwood.edu", address: "15 Birch Lane, Springfield", parentName: "Carlos Rodriguez", parentPhone: "+1 555 0105", parentEmail: "c.rodriguez@email.com", status: "Active", joined: "2021-09-01", bloodGroup: "B+", nationality: "Hispanic" },
  S004: { id: "S004", name: "Ethan Chen", initials: "EC", avatarColor: "bg-red-500", grade: "SS1", gender: "Male", dob: "2010-05-30", phone: "+1 555 0106", email: "ethan.c@westwood.edu", address: "7 Pine Road, Springfield", parentName: "Li Chen", parentPhone: "+1 555 0107", parentEmail: "li.chen@email.com", status: "Inactive", joined: "2022-09-01", bloodGroup: "AB+", nationality: "Chinese-American" },
  S005: { id: "S005", name: "Priya Patel", initials: "PP", avatarColor: "bg-violet-500", grade: "SS3", gender: "Female", dob: "2007-08-19", phone: "+1 555 0108", email: "priya.p@westwood.edu", address: "99 Cedar Blvd, Springfield", parentName: "Raj Patel", parentPhone: "+1 555 0109", parentEmail: "raj.patel@email.com", status: "Active", joined: "2020-09-01", bloodGroup: "O-", nationality: "Indian-American" },
  S006: { id: "S006", name: "James Thompson", initials: "JT", avatarColor: "bg-pink-500", grade: "JSS3", gender: "Male", dob: "2012-02-11", phone: "+1 555 0110", email: "james.t@westwood.edu", address: "33 Elm Way, Springfield", parentName: "Sarah Thompson", parentPhone: "+1 555 0111", parentEmail: "s.thompson@email.com", status: "Active", joined: "2024-09-01", bloodGroup: "B-", nationality: "American" },
  S007: { id: "S007", name: "Layla Hassan", initials: "LH", avatarColor: "bg-sky-500", grade: "SS2", gender: "Female", dob: "2009-12-28", phone: "+1 555 0112", email: "layla.h@westwood.edu", address: "21 Willow Dr, Springfield", parentName: "Omar Hassan", parentPhone: "+1 555 0113", parentEmail: "o.hassan@email.com", status: "Active", joined: "2022-09-01", bloodGroup: "A-", nationality: "Lebanese-American" },
  S008: { id: "S008", name: "Noah Anderson", initials: "NA", avatarColor: "bg-indigo-500", grade: "JSS3", gender: "Male", dob: "2011-04-07", phone: "+1 555 0114", email: "noah.a@westwood.edu", address: "55 Aspen Court, Springfield", parentName: "Claire Anderson", parentPhone: "+1 555 0115", parentEmail: "c.anderson@email.com", status: "Active", joined: "2023-09-01", bloodGroup: "O+", nationality: "American" },
  S009: { id: "S009", name: "Femi Adeyemi", initials: "FA", avatarColor: "bg-indigo-500", grade: "SS2", gender: "Male", dob: "2009-06-14", phone: "+1 555 0120", email: "femi.a@westwood.edu", address: "11 Cedar Close, Springfield", parentName: "Tunde Adeyemi", parentPhone: "+1 555 0121", parentEmail: "t.adeyemi@email.com", status: "Active", joined: "2022-09-01", bloodGroup: "B+", nationality: "Nigerian-American" },
  S010: { id: "S010", name: "Chidi Okafor", initials: "CO", avatarColor: "bg-violet-500", grade: "SS2", gender: "Male", dob: "2009-02-22", phone: "+1 555 0122", email: "chidi.o@westwood.edu", address: "3 Palm Drive, Springfield", parentName: "Ngozi Okafor", parentPhone: "+1 555 0123", parentEmail: "n.okafor@email.com", status: "Active", joined: "2022-09-01", bloodGroup: "A+", nationality: "Nigerian-American" },
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const SESSIONS = [
  "2025-26 Term 3",
  "2025-26 Term 2",
  "2025-26 Term 1",
  "2024-25 Term 3",
  "2024-25 Term 2",
  "2024-25 Term 1",
];

// ─── Result data generator ─────────────────────────────────────────────────────

export const SUBJECTS_BY_GRADE: Record<string, string[]> = {
  SS3:  ["Biology", "Chemistry", "Physics", "Mathematics", "English Language", "Further Maths", "Literature"],
  SS2:  ["Biology", "Chemistry", "Physics", "Mathematics", "English Language", "Geography", "Literature"],
  SS1:  ["Biology", "Chemistry", "Physics", "Mathematics", "English Language", "Agricultural Science", "Literature"],
  JSS3: ["Basic Science", "Mathematics", "English Language", "Social Studies", "Christian Religious Studies", "Civic Education", "French"],
  JSS2: ["Basic Science", "Mathematics", "English Language", "Social Studies", "Christian Religious Studies", "Civic Education", "French"],
};

export function seedRand(seed: number, session: string, subject: string): number {
  const str = `${seed}${session}${subject}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateResults(studentId: string, grade: string, session: string) {
  const subjects = SUBJECTS_BY_GRADE[grade] ?? SUBJECTS_BY_GRADE.SS2;
  const seed = parseInt(studentId.replace("S", ""), 10);
  return subjects.map((subject) => {
    const r = (col: number) => 10 + (seedRand(seed + col, session, subject) % 11); // 10-20
    const ca1 = r(1); const ca2 = r(2); const ca3 = r(3);
    const mid = 40 + (seedRand(seed + 4, session, subject) % 31); // 40-70
    const fin = 40 + (seedRand(seed + 5, session, subject) % 31);
    const total = ca1 + ca2 + ca3 + mid + fin;
    const grade_ =
      total >= 180 ? "A+" : total >= 165 ? "A" : total >= 150 ? "B+" :
      total >= 135 ? "B" : total >= 120 ? "C" : total >= 100 ? "D" : "F";
    const remark =
      total >= 165 ? "Excellent" : total >= 150 ? "Very Good" : total >= 135 ? "Good" :
      total >= 120 ? "Average" : total >= 100 ? "Below Average" : "Fail";
    return { subject, ca1, ca2, ca3, mid, fin, total, grade: grade_, remark };
  });
}

export function getGradeColor(g: string) {
  if (g === "A+" || g === "A") return "bg-indigo-100 text-indigo-800";
  if (g === "B+" || g === "B") return "bg-indigo-50 text-indigo-700";
  if (g === "C") return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-800";
}

// ─── Attendance data generator ─────────────────────────────────────────────────

export function generateAttendance(studentId: string, session: string) {
  const seed = parseInt(studentId.replace("S", ""), 10);
  const days: { date: string; week: number; dow: number; status: "P" | "A" | "L" | "H" }[] = [];
  // Simulate 60 school days across ~12 weeks
  const baseWeek = session.includes("T3") ? 20 : session.includes("T2") ? 6 : 32;
  for (let w = 0; w < 12; w++) {
    for (let d = 0; d < 5; d++) {
      const r = seedRand(seed + w * 10 + d, session, "att") % 100;
      const status: "P" | "A" | "L" | "H" =
        d === 4 && w % 3 === 2 ? "H" : // occasional friday holiday
        r < 5 ? "A" : r < 12 ? "L" : "P";
      days.push({ date: `W${baseWeek + w} D${d + 1}`, week: w, dow: d, status });
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



export const COURSE_TEACHERS: Record<string, { name: string; email: string; colorClass: string; bgClass: string }> = {
  "Biology":              { name: "Mr. Ade Okafor",    email: "teacher@westwood.edu", colorClass: "text-indigo-600", bgClass: "bg-indigo-50" },
  "Chemistry":            { name: "Mr. Ahmed Al-Rashid", email: "a.alrashid@westwood.edu", colorClass: "text-pink-500", bgClass: "bg-pink-50" },
  "Physics":              { name: "Ms. Priyanka Sharma", email: "p.sharma@westwood.edu", colorClass: "text-amber-500", bgClass: "bg-amber-50" },
  "Mathematics":          { name: "Dr. Eleanor Kim",   email: "e.kim@westwood.edu",   colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
  "English Language":     { name: "Mr. David Okafor",  email: "d.okafor@westwood.edu", colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
  "Further Maths":        { name: "Dr. Eleanor Kim",   email: "e.kim@westwood.edu",   colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
  "Literature":           { name: "Mr. David Okafor",  email: "d.okafor@westwood.edu", colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
  "Geography":            { name: "Mr. James Osei",    email: "j.osei@westwood.edu",  colorClass: "text-red-500", bgClass: "bg-red-50" },
  "Agricultural Science": { name: "Ms. Laura Nakamura", email: "l.nakamura@westwood.edu", colorClass: "text-violet-500", bgClass: "bg-violet-50" },
  "Basic Science":        { name: "Mr. Ade Okafor",    email: "teacher@westwood.edu", colorClass: "text-indigo-600", bgClass: "bg-indigo-50" },
  "Social Studies":       { name: "Mr. James Osei",    email: "j.osei@westwood.edu",  colorClass: "text-red-500", bgClass: "bg-red-50" },
  "Christian Religious Studies": { name: "Ms. Laura Nakamura", email: "l.nakamura@westwood.edu", colorClass: "text-violet-500", bgClass: "bg-violet-50" },
  "Civic Education":      { name: "Mr. James Osei",    email: "j.osei@westwood.edu",  colorClass: "text-red-500", bgClass: "bg-red-50" },
  "French":               { name: "Mr. David Okafor",  email: "d.okafor@westwood.edu", colorClass: "text-indigo-500", bgClass: "bg-indigo-50" },
};

