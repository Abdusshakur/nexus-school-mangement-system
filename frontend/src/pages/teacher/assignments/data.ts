export interface Assignment {
  id: string;
  title: string;
  class: string;
  dueDate: string;
  maxPoints: number;
  description: string;
  submittedCount: number;
  gradedCount: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentName: string;
  studentId: string;
  submissionDate: string;
  content: string;
  grade?: number;
  feedback?: string;
  status: "graded" | "pending";
}

export const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: "AS-1",
    title: "Lab Report 3: Force Vectors",
    class: "Physics & Thermodynamics",
    dueDate: "2026-07-15",
    maxPoints: 100,
    description: "Submit your parsed mathematical equations and force vector calibrations for the pulley system experiment.",
    submittedCount: 4,
    gradedCount: 2,
  },
  {
    id: "AS-2",
    title: "Linear Algebra Homework #4",
    class: "Advanced Mathematics III",
    dueDate: "2026-07-18",
    maxPoints: 50,
    description: "Solve problems 12 through 24 on matrix transformations, eigenvalues, and eigenspaces.",
    submittedCount: 3,
    gradedCount: 3,
  },
  {
    id: "AS-3",
    title: "Project 2: Binary Search Trees",
    class: "Computer Programming II",
    dueDate: "2026-07-22",
    maxPoints: 100,
    description: "Implement a fully working AVL balanced tree in Java, with insert, delete, and search operations.",
    submittedCount: 2,
    gradedCount: 0,
  },
];

export const DEFAULT_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-1",
    assignmentId: "AS-1",
    studentName: "Liam O'Connor",
    studentId: "S024",
    submissionDate: "Today, 10:45 AM",
    content: "I calculated the tension vector T1 = 45N and T2 = 32N using the pulley constant. The net sum equals 0 as predicted in statics equilibrium.",
    status: "pending",
  },
  {
    id: "SUB-2",
    assignmentId: "AS-1",
    studentName: "Sofia Rodriguez",
    studentId: "S012",
    submissionDate: "Yesterday, 4:12 PM",
    content: "Force diagrams are attached. Resultant force vector was 1.2N off due to pulley friction, which is accounted for in my error analysis coefficient of 0.05.",
    status: "pending",
  },
  {
    id: "SUB-3",
    assignmentId: "AS-1",
    studentName: "Aiden Vance",
    studentId: "S005",
    submissionDate: "2 days ago",
    content: "Pulley equilibrium was fully reached with mass ratios 1:2. Vectors balanced out perfectly. See spreadsheet data sheet.",
    grade: 98,
    feedback: "Exceptional error assessment and clear graphics, Aiden!",
    status: "graded",
  },
  {
    id: "SUB-4",
    assignmentId: "AS-1",
    studentName: "Zoe Chen",
    studentId: "S018",
    submissionDate: "2 days ago",
    content: "Force vector analysis report. Everything matches classical Newtonian mechanics, error limit < 1.5%.",
    grade: 95,
    feedback: "Well done, Zoe.",
    status: "graded",
  },
];
