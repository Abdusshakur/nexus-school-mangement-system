export interface Classroom {
  id: string;
  name: string;
  code: string;
  schedule: string;
  room: string;
  count: number;
  gradeAverage: string;
  attendanceRate: string;
  nextClass: string;
  color: string;
  syllabus: string[];
}

export const CLASSES_DATA: Classroom[] = [
  {
    id: "CLS-101",
    name: "Advanced Mathematics III",
    code: "MATH-301-A",
    schedule: "Mon, Wed 09:00 AM - 10:30 AM",
    room: "Room 402, Science Annex",
    count: 28,
    gradeAverage: "86.4% (B+)",
    attendanceRate: "92%",
    nextClass: "Tomorrow, 09:00 AM",
    color: "bg-blue-500",
    syllabus: [
      "Limits, continuity and derivatives",
      "Methods of integration & calculus theorems",
      "Vectors & linear algebra matrices",
      "Differential equations & Laplace transforms",
    ],
  },
  {
    id: "CLS-102",
    name: "Physics & Thermodynamics",
    code: "PHYS-202-B",
    schedule: "Tue, Thu 11:00 AM - 12:30 PM",
    room: "Room 105, Physics Lab",
    count: 32,
    gradeAverage: "84.2% (B)",
    attendanceRate: "88%",
    nextClass: "Today, 11:00 AM",
    color: "bg-indigo-500",
    syllabus: [
      "Classical Newtonian forces & vectors",
      "Rotational dynamics & torque calibration",
      "Laws of thermodynamics & heat engines",
      "Maxwell equations & electromagnetism basics",
    ],
  },
  {
    id: "CLS-103",
    name: "Computer Programming II",
    code: "COMP-204-A",
    schedule: "Mon, Wed, Fri 02:00 PM - 03:30 PM",
    room: "Room 304, Computer Lab A",
    count: 22,
    gradeAverage: "91.8% (A-)",
    attendanceRate: "96%",
    nextClass: "Today, 02:00 PM",
    color: "bg-violet-500",
    syllabus: [
      "Object-Oriented Programming (OOP) paradigms",
      "Data structures: lists, stacks, queues",
      "Tree balancing: AVL trees & red-black trees",
      "Recursion & sorting algorithms optimization",
    ],
  },
];

export const STUDENTS_ROSTERS: Record<string, string[]> = {
  "CLS-101": [
    "Liam O'Connor",
    "Sofia Rodriguez",
    "Aiden Vance",
    "Zoe Chen",
    "Chloe Baker",
    "Lucas Vance",
  ],
  "CLS-102": [
    "Liam O'Connor",
    "Aiden Vance",
    "Zoe Chen",
    "Nathan Brooks",
    "Mila Patel",
    "Chloe Baker",
  ],
  "CLS-103": [
    "Sofia Rodriguez",
    "Lucas Vance",
    "Mila Patel",
    "Eli Bennett",
    "Maya Thompson",
    "Nathan Brooks",
  ],
};
