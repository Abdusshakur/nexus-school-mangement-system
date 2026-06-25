import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home/pages/Home";
import Login from "./components/auth/pages/Login";
// import ForgotPassword from "./components/pages/auth/ForgotPassword";

// Import dashboard components
import { DashboardLayout } from "./components/dashboard/pages/DashboardLayout";
import { DashboardPage } from "./components/dashboard/pages/DashboardPage";
import {
  StudentsPage,
  StudentDetailPage,
} from "./components/dashboard/pages/Students";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

      {/* Authenticated Dashboard Core Routes wrapped inside DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Student Directory & Details */}
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/students/:id" element={<StudentDetailPage />} />

        {/* System Settings */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
