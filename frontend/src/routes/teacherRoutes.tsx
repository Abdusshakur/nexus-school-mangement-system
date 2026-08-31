import { Route } from "react-router-dom";
import { RoleRoute } from "./RoleRoute";
import { UserRole } from "../types/roles";

import TeacherDashboard from "../pages/teacher/dashboard/DashboardPage";
import TeacherClasses from "../pages/teacher/classes/ClassesPage";
import ClassDetail from "../pages/teacher/classes/ClassDetailPage";
import TeacherAssignments from "../pages/teacher/assignments/AssignmentsPage";
import TeacherAttendance from "../pages/teacher/attendance/AttendanceDashboard";
import TeacherAnnouncements from "../pages/teacher/announcements/AnnouncementsPage";
import TeacherGrades from "../pages/teacher/grades/GradesPage";
import TeacherStudents from "../pages/teacher/students/StudentsPage";
import { StudentDetailPage } from "../pages/admin/dashboard/Students";
import TeacherMyAttendancePage from "../pages/teacher/attendance/MyAttendancePage";

import TeacherProfile from "../pages/teacher/profile/ProfilePage";
import TeacherSettingsPage from "../pages/teacher/settings/SettingsPage";
import TeacherTimetable from "../pages/teacher/timetable/TeacherTimetable";

export const teacherRoutes = (
  <Route
    path="/teacher"
    element={<RoleRoute allowedRoles={[UserRole.TEACHER]} />}
  >
    <Route index element={<TeacherDashboard />} />
    <Route path="dashboard" element={<TeacherDashboard />} />
    <Route path="classes" element={<TeacherClasses />} />
    <Route path="classes/:id" element={<ClassDetail />} />
    <Route path="assignments" element={<TeacherAssignments />} />
    <Route path="attendance" element={<TeacherAttendance />} />
    <Route path="my-attendance" element={<TeacherMyAttendancePage />} />
    <Route path="announcements" element={<TeacherAnnouncements />} />
    <Route path="grades" element={<TeacherGrades />} />
    <Route path="students" element={<TeacherStudents />} />
    <Route path="students/:id" element={<StudentDetailPage />} />
    <Route path="timetable" element={<TeacherTimetable />} />

    <Route path="profile" element={<TeacherProfile />} />
    <Route path="settings" element={<TeacherSettingsPage />} />
  </Route>
);
