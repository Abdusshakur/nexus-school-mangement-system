import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Teacher {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  qualification: string;
  dept: string;
  title: string;
  address: string;
  classes: string[];
  subjects: string[];
  status: string;
  defaultPassword?: string;
  avatar: string;
  avatarColor: string;
  experience: string;
  classrooms: number;
}

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: "T001",
    staffId: "T001",
    name: "Dr. Eleanor Kim",
    dept: "Sciences",
    title: "Head of Science Department",
    email: "e.kim@westwood.edu",
    phone: "+1 555 0180",
    gender: "Female",
    qualification: "Ph.D.",
    address: "12 Faculty Quarters, Westwood",
    classes: ["ss1", "ss2", "ss3"],
    subjects: ["Physics", "Further Mathematics"],
    status: "Active",
    defaultPassword: "WelcomeEleanor1!",
    avatar: "EK",
    avatarColor: "bg-indigo-500",
    experience: "12 Years",
    classrooms: 3,
  },
  {
    id: "T002",
    staffId: "T002",
    name: "Mr. James Osei",
    dept: "Sciences",
    title: "Lead Physics Instructor",
    email: "j.osei@westwood.edu",
    phone: "+1 555 0181",
    gender: "Male",
    qualification: "B.Sc. + PGDE",
    address: "Westwood Campus",
    classes: ["ss1", "ss2"],
    subjects: ["Physics"],
    status: "Active",
    defaultPassword: "WelcomeJames1!",
    avatar: "JO",
    avatarColor: "bg-indigo-500",
    experience: "8 Years",
    classrooms: 2,
  },
  {
    id: "T003",
    staffId: "T003",
    name: "Mrs. Clara Higgins",
    dept: "Languages",
    title: "AP Literature Lecturer",
    email: "c.higgins@westwood.edu",
    phone: "+1 555 0182",
    gender: "Female",
    qualification: "M.A. + PGDE",
    address: "Westwood Campus",
    classes: ["jss1", "jss2", "jss3"],
    subjects: ["English Studies", "Literature-in-English"],
    status: "Active",
    defaultPassword: "WelcomeClara1!",
    avatar: "CH",
    avatarColor: "bg-indigo-650",
    experience: "15 Years",
    classrooms: 3,
  },
  {
    id: "T004",
    staffId: "T004",
    name: "Mr. David Alston",
    dept: "Mathematics",
    title: "Algebra & Calculus Coach",
    email: "d.alston@westwood.edu",
    phone: "+1 555 0183",
    gender: "Male",
    qualification: "M.Sc. + PGDE",
    address: "Westwood Campus",
    classes: ["ss1", "ss2", "ss3"],
    subjects: ["Mathematics", "Further Mathematics"],
    status: "Active",
    defaultPassword: "WelcomeDavid1!",
    avatar: "DA",
    avatarColor: "bg-indigo-500",
    experience: "6 Years",
    classrooms: 3,
  },
];

interface TeacherState {
  teachers: Teacher[];
  addTeacher: (teacher: Omit<Teacher, "id" | "staffId" | "defaultPassword" | "avatar" | "avatarColor" | "experience" | "classrooms" | "title">) => Teacher;
  updateTeacher: (teacher: Teacher) => void;
}

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
      teachers: INITIAL_TEACHERS,

      addTeacher: (form) => {
        const nextIdNumber = get().teachers.length + 1;
        const staffId = `T${nextIdNumber.toString().padStart(3, "0")}`;
        const defaultPassword = Math.random().toString(36).slice(-8) + "Tx1!";
        
        // Generate initials
        const parts = form.name.trim().split(" ");
        const first = parts[0] || "";
        const last = parts[parts.length - 1] || "";
        const initials = ((first[0] || "") + (last[0] || "")).toUpperCase();

        const avatarColors = ["bg-indigo-500", "bg-indigo-650", "bg-indigo-700"];
        const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

        const newTeacher: Teacher = {
          ...form,
          id: staffId,
          staffId,
          defaultPassword,
          title: `${form.qualification} Instructor`,
          avatar: initials,
          avatarColor: randomColor,
          experience: "0 Years",
          classrooms: form.classes.length,
        };

        set((state) => ({
          teachers: [...state.teachers, newTeacher],
        }));

        return newTeacher;
      },

      updateTeacher: (updated) =>
        set((state) => ({
          teachers: state.teachers.map((t) => (t.id === updated.id ? updated : t)),
        })),
    }),
    {
      name: "nexus_teachers_store",
    }
  )
);
