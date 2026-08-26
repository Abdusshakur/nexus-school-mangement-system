import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import { StudentDashboardPlaceholder } from "../pages/student/dashboard/StudentDashboardPlaceholder";
export const studentRoutes = (
  <Route
    path="/student"
    element={<RoleRoute allowedRoles={[UserRole.STUDENT]} />}
  >
    <Route index element={<StudentDashboardPlaceholder />} />
    <Route path="dashboard" element={<StudentDashboardPlaceholder />} />
  </Route>
);
