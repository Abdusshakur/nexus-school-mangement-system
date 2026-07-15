export interface NotificationSetting {
  id: string;
  label: string;
  desc: string;
  defaultOn: boolean;
}

export const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "announcements",
    label: "New announcements",
    desc: "Notify when admin posts a new announcement",
    defaultOn: true,
  },
  {
    id: "messages",
    label: "Parent messages",
    desc: "Notify when a parent sends you a message",
    defaultOn: true,
  },
  {
    id: "submissions",
    label: "Assignment submissions",
    desc: "Notify when students submit assignments",
    defaultOn: false,
  },
  {
    id: "grades",
    label: "Grade submission reminders",
    desc: "Remind me 3 days before grade deadline",
    defaultOn: true,
  },
  {
    id: "attendance",
    label: "Attendance reminders",
    desc: "Daily reminder to mark attendance at 8:30 AM",
    defaultOn: false,
  },
];

export const LANGUAGES = [
  "English (US)",
  "English (UK)",
  "Yoruba",
  "Igbo",
  "Hausa",
] as const;

export const TIMEZONES = [
  "Africa/Lagos (GMT+1)",
  "UTC",
  "America/New_York",
] as const;
