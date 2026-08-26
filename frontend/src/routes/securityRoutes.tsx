import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import { SecurityDashboard } from "../pages/security/SecurityDashboard";

export const securityRoutes = (
  <Route path="/security" element={<RoleRoute allowedRoles={[UserRole.SECURITY]} />}>
    <Route path="dashboard" element={<SecurityDashboard />} />
  </Route>
);
