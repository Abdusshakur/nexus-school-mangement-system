export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  authorRole?: string;
  date: string;
}

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "A1",
    title: "Physics Lab Report Extension",
    content: "The submission deadline for Lab Report #3 has been extended to Friday at 11:59 PM. Make sure to include all calibration calculations.",
    target: "Physics & Thermodynamics",
    author: "Dr. Eleanor Kim",
    date: "Today, 10:15 AM",
  },
  {
    id: "A2",
    title: "Mid-Term Review Sheets Posted",
    content: "Extra-help review sheets are now available on the resources tab. Please review them before our Thursday review session.",
    target: "Advanced Mathematics III",
    author: "Dr. Eleanor Kim",
    date: "Yesterday, 3:30 PM",
  },
  {
    id: "A3",
    title: "School-wide Science Fair Registration",
    content: "Registration for the annual school-wide science and engineering fair is open until next Friday. Cash prizes for top 3 projects!",
    target: "All School",
    author: "Principal Sarah Admin",
    date: "3 days ago",
  },
];
