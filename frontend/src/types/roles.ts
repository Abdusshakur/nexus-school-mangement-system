export const UserRole = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
  SECURITY: "security",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
