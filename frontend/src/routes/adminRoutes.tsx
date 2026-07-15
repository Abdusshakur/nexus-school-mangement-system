import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import { DashboardPage } from "../pages/admin/dashboard/DashboardPage";
import {
  StudentsPage,
  StudentDetailPage,
  AddStudentPage,
} from "../pages/admin/dashboard/Students";
import { ParentDetail } from "../pages/admin/parents/ParentDetailPage";
import { ParentList } from "../pages/admin/parents/ParentPage";
import { TeacherDetailPage } from "../pages/admin/teachers/TeacherDetailPage";
import { TeachersPage } from "../pages/admin/teachers/TeachersPage";
import { AttendanceDashboard } from "../pages/admin/attendance/AttendanceDashboard";
import { MarkAttendance } from "../pages/admin/attendance/MarkAttendance";
import { AttendanceReport } from "../pages/admin/attendance/AttendanceReport";
import { AnnouncementList } from "../pages/admin/announcements/AnnoncementList";
import { CreateAnnouncement } from "../pages/admin/announcements/createAnnouncement";
import { AnnouncementDetail } from "../pages/admin/announcements/AnnoncementDetails";
import { Settings } from "../pages/admin/settings/Settings";

export const adminRoutes = (
  <Route path="/admin" element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
    <Route index element={<DashboardPage />} />
    <Route path="dashboard" element={<DashboardPage />} />
    <Route path="students" element={<StudentsPage />} />
    <Route path="students/add" element={<AddStudentPage />} />
    <Route path="students/:id" element={<StudentDetailPage />} />
    <Route path="teachers" element={<TeachersPage />} />
    <Route path="teachers/:id" element={<TeacherDetailPage />} />
    <Route path="parents" element={<ParentList />} />
    <Route path="parents/:id" element={<ParentDetail />} />
    <Route path="attendance" element={<AttendanceDashboard />} />
    <Route path="attendance/mark" element={<MarkAttendance />} />
    <Route path="attendance/report" element={<AttendanceReport />} />
    <Route path="announcements" element={<AnnouncementList />} />
    <Route path="announcements/create" element={<CreateAnnouncement />} />
    <Route path="announcements/:id" element={<AnnouncementDetail />} />
    <Route path="settings" element={<Settings />} />
  </Route>
);
