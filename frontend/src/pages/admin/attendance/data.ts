export const studentsList = [
  {
    id: "S001",
    name: "Amelia Johnson",
    grade: "SS 1",
    avatar: "AJ",
    avatarColor: "bg-indigo-500",
  },
  {
    id: "S002",
    name: "Marcus Williams",
    grade: "JSS 2",
    avatar: "MW",
    avatarColor: "bg-indigo-500",
  },
  {
    id: "S003",
    name: "Sofia Rodriguez",
    grade: "SS 2",
    avatar: "SR",
    avatarColor: "bg-amber-500",
  },
  {
    id: "S004",
    name: "Ethan Chen",
    grade: "JSS 3",
    avatar: "EC",
    avatarColor: "bg-red-500",
  },
  {
    id: "S005",
    name: "Priya Patel",
    grade: "SS 3",
    avatar: "PP",
    avatarColor: "bg-violet-500",
  },
  {
    id: "S006",
    name: "Ademide Faith",
    grade: "JSS 1",
    avatar: "AF",
    avatarColor: "bg-pink-500",
  },
  {
    id: "S007",
    name: "Layla Hassan",
    grade: "SS 1",
    avatar: "LH",
    avatarColor: "bg-sky-500",
  },
  {
    id: "S008",
    name: "Noah Anderson",
    grade: "JSS 2",
    avatar: "NA",
    avatarColor: "bg-indigo-500",
  },
];

export const weeklyData = [
  { week: "Week 1", present: 238, absent: 12, late: 5 },
  { week: "Week 2", present: 225, absent: 18, late: 7 },
  { week: "Week 3", present: 242, absent: 6, late: 2 },
  { week: "Week 4", present: 230, absent: 14, late: 6 },
];

export type AttendanceStatus = "Present" | "Absent" | "Late" | "";

export type DailyStatus = "PRESENT" | "ABSENT" | "LATE" | "HOLIDAY";

export interface StudentMonthlyRecord {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  grade: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  rate: number;
  heatmap: DailyStatus[];
}

export function generateMockMonthlyAttendance(
  className: string,
  daysInMonth: number = 22, // Weekdays only
): StudentMonthlyRecord[] {
  // Filter mock students by class
  const classStudents = studentsList.filter((s) => s.grade === className);

  return classStudents.map((student, idx) => {
    const heatmap: DailyStatus[] = [];
    let present = 0;
    let absent = 0;
    let late = 0;

    for (let i = 0; i < daysInMonth; i++) {
      const rand = Math.random();
      // Pseudo-random but heavily skewed toward present
      let status: DailyStatus = "PRESENT";
      if (rand > 0.85) status = "ABSENT";
      else if (rand > 0.70) status = "LATE";

      // Make a couple of specific students have perfect attendance or poor attendance
      if (idx === 0) status = "PRESENT"; // Perfect
      if (idx === 1 && i % 4 === 0) status = "ABSENT"; // Poor

      heatmap.push(status);

      if (status === "PRESENT") present++;
      else if (status === "ABSENT") absent++;
      else if (status === "LATE") late++;
    }

    return {
      ...student,
      totalPresent: present,
      totalAbsent: absent,
      totalLate: late,
      rate: Math.round(((present + late) / daysInMonth) * 100),
      heatmap,
    };
  });
}
