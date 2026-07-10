import { AlertCircle, Info, CheckCircle } from "lucide-react";

export const announcements = [
  {
    id: "A1",
    title: "Science Fair Registration Open",
    body: "We are excited to announce that registration for the Annual Westwood Science Fair is now open! Students from Grades 8–12 are eligible to participate. This year's theme is 'Innovations for a Sustainable Future.' Registration deadline is June 30, 2026. Submit your project proposals through the student portal or visit the science department office.",
    date: "Jun 14, 2026",
    priority: "high",
    audience: "All Students",
    author: "Dr. Eleanor Kim",
    category: "Academic",
  },
  {
    id: "A2",
    title: "Parent-Teacher Meeting — June 20",
    body: "The quarterly Parent-Teacher Meeting is scheduled for June 20, 2026 from 9:00 AM to 1:00 PM. All parents and guardians are strongly encouraged to attend. Individual appointment slots are available for 15-minute sessions with each teacher. Please book your appointments through the parent portal by June 17.",
    date: "Jun 13, 2026",
    priority: "medium",
    audience: "All Parents",
    author: "Sarah Admin",
    category: "Events",
  },
  {
    id: "A3",
    title: "Library Hours Extended for Finals",
    body: "The school library will be open extended hours during the final exam period (June 20–30). New hours: Monday to Friday 7:00 AM – 9:00 PM, Saturday 9:00 AM – 6:00 PM. All students are welcome. Study pods can be reserved in advance through the library portal.",
    date: "Jun 12, 2026",
    priority: "low",
    audience: "All",
    author: "Sarah Admin",
    category: "Facilities",
  },
  {
    id: "A4",
    title: "Sports Day — July 5, 2026",
    body: "Westwood Academy's annual Sports Day will be held on July 5, 2026 at the school athletics ground. All students are required to participate in at least one event. Sign-up sheets are available with your form teachers. Please bring your sports kit and a packed lunch.",
    date: "Jun 10, 2026",
    priority: "medium",
    audience: "All Students",
    author: "Mr. James Osei",
    category: "Sports",
  },
];

export const priorityConfig = {
  high: { label: "High", color: "#EF4444", bg: "#FEE2E2", icon: AlertCircle },
  medium: { label: "Medium", color: "#F59E0B", bg: "#FEF3C7", icon: Info },
  low: { label: "Low", color: "#10B981", bg: "#D1FAE5", icon: CheckCircle },
};
