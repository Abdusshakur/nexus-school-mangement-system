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
  Archive,
  // MessageSquare,
  UserCircle,
  Baby,
  Bell,
  TrendingUp,
  QrCode,
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
    label: "Timetable",
    href: ROUTES.ADMIN.TIMETABLE,
    icon: CalendarCheck,
  },
  {
    label: "Sessions",
    href: ROUTES.ADMIN.SESSIONS,
    icon: Archive,
  },
  {
    label: "Settings",
    href: ROUTES.ADMIN.SETTINGS,
    icon: Settings,
  },
];

export const ADMIN_ATTENDANCE_SUB_ITEMS = [
  { label: "Overview", href: ROUTES.ADMIN.ATTENDANCE, icon: LayoutDashboard },
  {
    label: "Class Attendance",
    href: ROUTES.ADMIN.ATTENDANCE_CLASSES,
    icon: CalendarCheck,
  },
  {
    label: "Performance Report",
    href: ROUTES.ADMIN.ATTENDANCE_REPORT,
    icon: TrendingUp,
  },
  {
    label: "Teacher Assignment",
    href: ROUTES.ADMIN.ATTENDANCE_TEACHERS,
    icon: ClipboardList,
  },
  {
    label: "QR Scanner",
    href: ROUTES.ADMIN.ATTENDANCE_TEACHER_RECORDS,
    icon: QrCode,
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
    label: "Timetable",
    href: ROUTES.TEACHER.TIMETABLE,
    icon: CalendarCheck,
  },
  {
    label: "My Attendance",
    href: ROUTES.TEACHER.MY_ATTENDANCE,
    icon: CalendarCheck,
  },
  {
    label: "Student Attendance",
    href: ROUTES.TEACHER.ATTENDANCE,
    icon: Users,
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
  // {
  //   label: "Messages",
  //   href: ROUTES.TEACHER.MESSAGES,
  //   icon: MessageSquare,
  // },
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

const PARENT_NAV_ITEMS = [
  {
    label: "Dashboard",
    href: ROUTES.PARENT.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    label: "My Children",
    href: ROUTES.PARENT.CHILDREN,
    icon: Baby,
  },
  {
    label: "Attendance",
    href: ROUTES.PARENT.ATTENDANCE,
    icon: CalendarCheck,
  },
  {
    label: "Assignments",
    href: ROUTES.PARENT.ASSIGNMENTS,
    icon: ClipboardList,
  },
  {
    label: "Results",
    href: ROUTES.PARENT.RESULTS,
    icon: Star,
  },
  {
    label: "Announcements",
    href: ROUTES.PARENT.ANNOUNCEMENTS,
    icon: Megaphone,
  },
  {
    label: "Notifications",
    href: ROUTES.PARENT.NOTIFICATIONS,
    icon: Bell,
  },
  {
    label: "Profile",
    href: ROUTES.PARENT.PROFILE,
    icon: UserCircle,
  },
];

const SECURITY_NAV_ITEMS = [
  {
    label: "QR Scanner",
    href: ROUTES.SECURITY.DASHBOARD,
    icon: LayoutDashboard,
  },
];

export function getNavItems(role: string | null) {
  if (role === "teacher") {
    return TEACHER_NAV_ITEMS;
  }
  if (role === "parent") {
    return PARENT_NAV_ITEMS;
  }
  if (role === "security") {
    return SECURITY_NAV_ITEMS;
  }
  return ADMIN_NAV_ITEMS;
}

export function getPrimaryNavItems(role: string | null) {
  if (role === "teacher") {
    return [
      TEACHER_NAV_ITEMS[0], // Dashboard
      TEACHER_NAV_ITEMS[1], // My Classes
      TEACHER_NAV_ITEMS[4], // Student Attendance
      TEACHER_NAV_ITEMS[5], // Assignments
    ];
  }
  if (role === "parent") {
    return [
      PARENT_NAV_ITEMS[0], // Dashboard
      PARENT_NAV_ITEMS[1], // My Children
      PARENT_NAV_ITEMS[2], // Attendance
      PARENT_NAV_ITEMS[4], // Results
    ];
  }
  if (role === "security") {
    return SECURITY_NAV_ITEMS;
  }
  // Admin default
  return [
    ADMIN_NAV_ITEMS[0], // Dashboard
    ADMIN_NAV_ITEMS[1], // Students
    ADMIN_NAV_ITEMS[4], // Attendance
    ADMIN_NAV_ITEMS[5], // Announcements
  ];
}
