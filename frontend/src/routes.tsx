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
import { AttendanceDashboard } from "./pages/attendance/AttendanceDashboard";
import { MarkAttendance } from "./pages/attendance/MarkAttendance";
import { AttendanceReport } from "./pages/attendance/AttendanceReport";
import { AnnouncementList } from "./pages/announcements/AnnoncemenntList";
import { CreateAnnouncement } from "./pages/announcements/createAnnouncement";
import { AnnouncementDetail } from "./pages/announcements/AnnoncementDetails";
import { Settings } from "./pages/settings/Settings";

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

        {/* Attendance Dashboard */}
        <Route path="/attendance" element={<AttendanceDashboard />} />
        <Route path="/attendance/mark" element={<MarkAttendance />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />

        {/* Announcements */}
        <Route path="/announcements" element={<AnnouncementList />} />
        <Route path="/announcements/create" element={<CreateAnnouncement />} />
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
