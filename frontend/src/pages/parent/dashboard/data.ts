export const mockProfile = {
  id: "p1",
  name: "Tife Ifedamola",
  email: "parent@nexus.com",
  phone: "+234 800 000 0000",
  address: "123 Main St, Lagos",
  relationship: "Mother",
  avatar: "TI",
  avatarColor: "bg-indigo-500",
  children: [
    {
      id: "std-001",
      name: "TUnde Boss",
      admNo: "NEX-2026-0001",
      className: "JSS 1 A",
      classId: "JSS1A",
    },
    {
      id: "std-002",
      name: "Remi Akin",
      admNo: "NEX-2026-0002",
      className: "JSS 3 B",
      classId: "JSS3B",
    },
  ],
};

export const mockAssignments = [
  {
    id: "ass-1",
    title: "Algebra Homework",
    subject: "Mathematics",
    classId: "JSS1A",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days from now
    priority: "High",
    status: "published",
  },
  {
    id: "ass-2",
    title: "Essay on Global Warming",
    subject: "English",
    classId: "JSS3B",
    dueDate: new Date(Date.now() - 86400000).toISOString(), // overdue
    priority: "Medium",
    status: "published",
  },
  {
    id: "ass-3",
    title: "Photosynthesis Experiment",
    subject: "Basic Science",
    classId: "JSS1A",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    priority: "Low",
    status: "published",
  },
];

export const mockNotifications = [
  {
    id: "notif-1",
    title: "School Fees Reminder",
    message:
      "Please ensure third term fees are paid before the resumption date.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    read: false,
  },
  {
    id: "notif-2",
    title: "PTA Meeting Schedule",
    message:
      "The next PTA meeting will hold on Saturday. Your attendance is highly required.",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true,
  },
];
