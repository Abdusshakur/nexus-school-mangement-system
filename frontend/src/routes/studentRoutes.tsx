import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

const StudentDashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Student Dashboard (Coming Soon)</h1>
  </div>
);

export const studentRoutes = (
  <Route
    path="/student"
    element={<RoleRoute allowedRoles={[UserRole.STUDENT]} />}
  >
    <Route index element={<StudentDashboardPlaceholder />} />
    <Route path="dashboard" element={<StudentDashboardPlaceholder />} />
  </Route>
);
