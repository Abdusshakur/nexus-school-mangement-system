export interface StudentAttendance {
  id: string;
  name: string;
  avatar: string;
  status: "Present" | "Absent" | "Late";
}

export const DEFAULT_ROSTER: StudentAttendance[] = [
  { id: "S024", name: "Liam O'Connor", avatar: "LO", status: "Present" },
  { id: "S012", name: "Sofia Rodriguez", avatar: "SR", status: "Present" },
  { id: "S005", name: "Aiden Vance", avatar: "AV", status: "Present" },
  { id: "S018", name: "Zoe Chen", avatar: "ZC", status: "Present" },
  { id: "S009", name: "Chloe Baker", avatar: "CB", status: "Late" },
  { id: "S015", name: "Lucas Vance", avatar: "LV", status: "Present" },
];
