import { UserRole } from "../types/roles";

/**
 * Maps roles to their corresponding dashboard theme and configuration.
 * Extracted from previous implementations.
 */
export const roleConfig = {
  [UserRole.ADMIN]: {
    // theme: adminTheme,
  },
  [UserRole.TEACHER]: {
    // theme: teacherTheme,
  },
  [UserRole.STUDENT]: {
    // theme: studentTheme,
  },
  [UserRole.PARENT]: {
    // theme: parentTheme,
  }
};
