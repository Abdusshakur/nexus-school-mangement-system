import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Megaphone,
  Calendar,
  Settings,
} from "lucide-react";

export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    href: "/students",
    icon: Users,
  },
  {
    label: "Teachers",
    href: "/teachers",
    icon: GraduationCap,
  },
  {
    label: "Parents",
    href: "/parents",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/attendance",
    icon: Calendar,
  },
  {
    label: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
