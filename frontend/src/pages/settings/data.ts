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

export const roleColors: Record<string, { bg: string; color: string }> = {
  Administrator: { bg: "#EEF2FF", color: "#6366F1" },
  Principal: { bg: "#F0FDF4", color: "#10B981" },
  Registrar: { bg: "#FEF3C7", color: "#F59E0B" },
  Counselor: { bg: "#F5F3FF", color: "#8B5CF6" },
};
