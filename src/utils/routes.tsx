import { createBrowserRouter } from "react-router";
import StudentDashboard from "../pages/StudentDashboard";
import StudentView from "../pages/StudentView";
import AddStudent from "../pages/AddStudent";
import EditStudent from "../pages/EditStudent";
import TeacherDashboard from "../pages/TeacherDashboard";
import TeacherView from "../pages/TeacherView";
import AddTeacher from "../pages/AddTeacher";
import EditTeacher from "../pages/EditTeacher";
import Reports from "../pages/Reports";
import AttendanceResult from "../pages/AttendanceResult";
import ManageClasses from "../pages/ManageClasses";
import ManageSubjects from "../pages/ManageSubjects";
import FaceRecognition from "../pages/FaceRecognition";
import DashboardLayout from "../components/DashboardLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: DashboardLayout,
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
    Component: StudentDashboard,
  },
]);
