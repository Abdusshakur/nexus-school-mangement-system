import { create } from "zustand";
import { fetchTeachersList, fetchTeacherById } from "../api/teachers";
import { formatParentInitials } from "../utils/formatters";

export interface Teacher {
  id: string;
  user_id: string;
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
  created_at: string;
}

interface TeacherState {
  teachers: Teacher[];
  loading: boolean;
  error: string | null;

  fetchTeachers: () => Promise<Teacher[]>;
  updateTeacher: (updated: Teacher) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  teachers: [],
  loading: false,
  error: null,

  fetchTeachers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchTeachersList();
      
      const detailsPromises = data.map((t) => fetchTeacherById(t.id).catch(() => null));
      const details = await Promise.all(detailsPromises);

      const mappedTeachers: Teacher[] = data.map((d, index) => {
        const detail = details[index];
        const name = `${d.first_name} ${d.last_name}`;
        const initials = formatParentInitials(name);
        const colors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-cyan-500", "bg-pink-500"];
        const colorIndex = d.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
        const avatarColor = colors[colorIndex];

        return {
          id: d.id,
          user_id: d.user_id,
          staffId: d.id.substring(0, 8).toUpperCase(),
          name,
          email: d.email,
          phone: d.phone_number,
          gender: d.gender,
          qualification: d.qualification,
          dept: d.department,
          title: `${d.qualification || "Teacher"}`,
          address: d.address,
          classes: detail ? detail.assigned_classes.map(c => c.name) : [],
          subjects: detail ? detail.assigned_subjects.map(s => s.name) : [],
          status: "Active",
          avatar: initials,
          avatarColor,
          experience: "1 Year",
          classrooms: 0,
          created_at: d.created_at,
        };
      });

      set({ teachers: mappedTeachers, loading: false });
      return mappedTeachers;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch teachers.";
      set({ error: msg, loading: false });
      throw err;
    }
  },

  updateTeacher: (updated) =>
    set((state) => ({
      teachers: state.teachers.map((t) => (t.id === updated.id ? updated : t)),
    })),
}));
