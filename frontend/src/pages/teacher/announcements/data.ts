export interface Announcement {
  id: string;
  title: string;
  content: string;
  target: string;
  author: string;
  authorRole?: string;
  date: string;
}

export const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];
