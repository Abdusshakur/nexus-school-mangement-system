import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import { ParentDashboard } from "../pages/parent/dashboard/ParentDashboard";
import { ParentChildren } from "../pages/parent/children/ParentChildren";
import { ParentAttendance } from "../pages/parent/attendance/ParentAttendance";
import { ParentResults } from "../pages/parent/results/ParentResults";

import { ParentAnnouncements } from "../pages/parent/announcements/ParentAnnouncements";
import { ParentProfile } from "../pages/parent/profile/ParentProfile";

import { ParentPlaceholder } from "../pages/parent/dashboard/ParentPlaceholder";
export const parentRoutes = (
  <Route
    path="/parent"
    element={<RoleRoute allowedRoles={[UserRole.PARENT]} />}
  >
    <Route index element={<ParentDashboard />} />
    <Route path="dashboard" element={<ParentDashboard />} />
    <Route path="children" element={<ParentChildren />} />
    <Route path="attendance" element={<ParentAttendance />} />
    <Route path="assignments" element={<ParentPlaceholder title="Assignments" />} />
    <Route path="results" element={<ParentResults />} />
    <Route path="announcements" element={<ParentAnnouncements />} />
    <Route path="notifications" element={<ParentPlaceholder title="Notifications" />} />
    <Route path="profile" element={<ParentProfile />} />
  </Route>
);
