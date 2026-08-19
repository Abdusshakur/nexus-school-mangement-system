import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import { ParentDashboard } from "../pages/parent/dashboard/ParentDashboard";


const ParentPlaceholder = ({ title }: { title: string }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
  </div>
);

export const parentRoutes = (
  <Route
    path="/parent"
    element={<RoleRoute allowedRoles={[UserRole.PARENT]} />}
  >
    <Route index element={<ParentDashboard />} />
    <Route path="dashboard" element={<ParentDashboard />} />
    <Route path="children" element={<ParentPlaceholder title="My Children" />} />
    <Route path="attendance" element={<ParentPlaceholder title="Attendance" />} />
    <Route path="assignments" element={<ParentPlaceholder title="Assignments" />} />
    <Route path="results" element={<ParentPlaceholder title="Results" />} />
    <Route path="announcements" element={<ParentPlaceholder title="Announcements" />} />
    <Route path="notifications" element={<ParentPlaceholder title="Notifications" />} />
    <Route path="profile" element={<ParentPlaceholder title="Profile" />} />
  </Route>
);
