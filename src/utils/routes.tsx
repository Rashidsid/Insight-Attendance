import { createBrowserRouter } from "react-router";
import Login from "../pages/admin/Login";
import StudentDashboard from "../pages/admin/StudentDashboard";
import StudentView from "../pages/admin/StudentView";
import AddStudent from "../pages/admin/AddStudent";
import EditStudent from "../pages/admin/EditStudent";
import TeacherDashboard from "../pages/admin/TeacherDashboard";
import TeacherView from "../pages/admin/TeacherView";
import AddTeacher from "../pages/admin/AddTeacher";
import EditTeacher from "../pages/admin/EditTeacher";
import Reports from "../pages/admin/Reports";
import AttendanceResult from "../pages/admin/AttendanceResult";
import ManageClasses from "../pages/admin/ManageClasses";
import ManageSubjects from "../pages/admin/ManageSubjects";
import FaceRecognition from "../pages/admin/FaceRecognition";
import HomePage from "../pages/user/HomePage";
import ProtectedLayout from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  // Login Route
  {
    path: "/admin/login",
    Component: Login,
  },
  // Home/User Routes - Face Recognition Page
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/user",
    Component: HomePage,
  },
  // Admin Routes - Protected
  {
    path: "/admin",
    Component: ProtectedLayout,
    children: [
      { index: true, Component: StudentDashboard },
      { path: "students", Component: StudentDashboard },
      { path: "students/:id", Component: StudentView },
      { path: "students/add", Component: AddStudent },
      { path: "students/edit/:id", Component: EditStudent },
      { path: "teachers", Component: TeacherDashboard },
      { path: "teachers/:id", Component: TeacherView },
      { path: "teachers/add", Component: AddTeacher },
      { path: "teachers/edit/:id", Component: EditTeacher },
      { path: "reports", Component: Reports },
      { path: "attendance-result", Component: AttendanceResult },
      { path: "manage-classes", Component: ManageClasses },
      { path: "manage-subjects", Component: ManageSubjects },
      { path: "face-recognition", Component: FaceRecognition },
    ],
  },
  {
    path: "*",
    Component: HomePage,
  },
]);
