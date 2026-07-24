import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

const ParentDashboardPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">Parent Dashboard </h1>
  </div>
);

export const parentRoutes = (
  <Route
    path="/parent"
    element={<RoleRoute allowedRoles={[UserRole.PARENT]} />}
  >
    <Route index element={<ParentDashboardPlaceholder />} />
    <Route path="dashboard" element={<ParentDashboardPlaceholder />} />
  </Route>
);
