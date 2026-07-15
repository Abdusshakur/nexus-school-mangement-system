import { School, Users, Bell, Shield } from "lucide-react";

export const tabs = [
  { id: "school", label: "School Settings", icon: School },
  { id: "users", label: "User Management", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export const initialUsers = [
  {
    id: "U001",
    name: "Sarah Admin",
    email: "s.admin@westwood.edu",
    role: "Administrator",
    status: "Active",
    lastLogin: "Jun 15, 2026",
  },
  {
    id: "U002",
    name: "John Principal",
    email: "j.principal@westwood.edu",
    role: "Principal",
    status: "Active",
    lastLogin: "Jun 14, 2026",
  },
  {
    id: "U003",
    name: "Mary Registrar",
    email: "m.registrar@westwood.edu",
    role: "Registrar",
    status: "Active",
    lastLogin: "Jun 13, 2026",
  },
  {
    id: "U004",
    name: "Tom Counselor",
    email: "t.counselor@westwood.edu",
    role: "Counselor",
    status: "Inactive",
    lastLogin: "Jun 1, 2026",
  },
];

export const roleColors: Record<string, string> = {
  Administrator: "bg-indigo-50 text-indigo-500",
  Principal: "bg-indigo-50 text-indigo-500",
  Registrar: "bg-amber-50 text-amber-500",
  Counselor: "bg-violet-50 text-violet-500",
};
