import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Megaphone,
  Calendar,
  CalendarCheck,
  Settings,
  BookOpen,
  ClipboardList,
  Star,
  MessageSquare,
  UserCircle
} from "lucide-react";
import { ROUTES } from "../../config/routes";

const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: ROUTES.ADMIN.STUDENTS,
    icon: Users,
  },
  {
    label: "Teachers",
    href: ROUTES.ADMIN.TEACHERS,
    icon: GraduationCap,
  },
  {
    label: "Parents",
    href: ROUTES.ADMIN.PARENTS,
    icon: Users,
  },
  {
    label: "Attendance",
    href: ROUTES.ADMIN.ATTENDANCE,
    icon: Calendar,
  },
  {
    label: "Announcements",
    href: ROUTES.ADMIN.ANNOUNCEMENTS,
    icon: Megaphone,
  },
  {
    label: "Academics",
    href: ROUTES.ADMIN.ACADEMICS,
    icon: BookOpen,
  },
  {
    label: "Settings",
    href: ROUTES.ADMIN.SETTINGS,
    icon: Settings,
  },
];

const TEACHER_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.TEACHER.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "My Classes",
    href: ROUTES.TEACHER.CLASSES,
    icon: BookOpen,
  },
  {
    label: "Attendance",
    href: ROUTES.TEACHER.ATTENDANCE,
    icon: CalendarCheck,
  },
  {
    label: "Assignments",
    href: ROUTES.TEACHER.ASSIGNMENTS,
    icon: ClipboardList,
  },
  {
    label: "Grades",
    href: ROUTES.TEACHER.GRADES,
    icon: Star,
  },
  {
    label: "Students",
    href: ROUTES.TEACHER.STUDENTS,
    icon: Users,
  },
  {
    label: "Announcements",
    href: ROUTES.TEACHER.ANNOUNCEMENTS,
    icon: Megaphone,
  },
  {
    label: "Messages",
    href: ROUTES.TEACHER.MESSAGES,
    icon: MessageSquare,
  },
  {
    label: "Profile",
    href: ROUTES.TEACHER.PROFILE,
    icon: UserCircle,
  },
  {
    label: "Settings",
    href: ROUTES.TEACHER.SETTINGS,
    icon: Settings,
  },
];

export function getNavItems(role: string | null) {
  if (role === "teacher") {
    return TEACHER_NAV_ITEMS;
  }
  return ADMIN_NAV_ITEMS;
}
