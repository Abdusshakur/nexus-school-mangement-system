import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./ProtectedRoute";
import { DashboardLayout } from "../layouts/DashboardLayout";

import { publicRoutes } from "./publicRoutes";
import { adminRoutes } from "./adminRoutes";
import { teacherRoutes } from "./teacherRoutes";
import { studentRoutes } from "./studentRoutes";
import { parentRoutes } from "./parentRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {publicRoutes}

      {/* Authenticated Dashboard Core Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {adminRoutes}
          {teacherRoutes}
          {studentRoutes}
          {parentRoutes}
        </Route>
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
