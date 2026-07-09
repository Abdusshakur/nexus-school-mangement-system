import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home/Home";
import Login from "./pages/auth/Login";
// import ForgotPassword from "./components/pages/auth/ForgotPassword";

// Import dashboard components
import { DashboardLayout } from "./pages/dashboard/DashboardLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import {
  StudentsPage,
  StudentDetailPage,
  AddStudentPage,
} from "./pages/dashboard/Students";
import { ParentDetail } from "./pages/parents/ParentDetailPage";
import { ParentList } from "./pages/parents/ParentPage";
import { TeacherDetailPage } from "./pages/teachers/TeacherDetailPage";
import { TeachersPage } from "./pages/teachers/TeachersPage";

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
        <Route path="/students/add" element={<AddStudentPage />} />

        {/* Teachers Directory & Details */}
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/teachers/:id" element={<TeacherDetailPage />} />

        {/* Parent Directory */}
        <Route path="/parents" element={<ParentList />} />
        <Route path="/parents/:id" element={<ParentDetail />} />

        {/* System Settings */}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
