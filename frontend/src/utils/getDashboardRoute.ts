import { UserRole } from "../types/roles";
import { ROUTES } from "../config/routes";

export const getDashboardRoute = (role: UserRole | string): string => {
  switch (role) {
    case UserRole.ADMIN:
      return ROUTES.ADMIN.DASHBOARD;
    case UserRole.TEACHER:
      return ROUTES.TEACHER.DASHBOARD;
    case UserRole.STUDENT:
      return ROUTES.STUDENT.DASHBOARD;
    case UserRole.PARENT:
      return ROUTES.PARENT.DASHBOARD;
    case UserRole.SECURITY:
      return ROUTES.SECURITY.DASHBOARD;
    default:
      return ROUTES.ADMIN.DASHBOARD;
  }
};
