import { Navigate, Outlet } from "react-router";
import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";

const ProtectedLayout = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is logged in via localStorage
    const loggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
    setIsChecking(false);
  }, []);

  // While checking auth status, show loading spinner
  if (isChecking) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  // If logged in, show the dashboard with outlet for child routes
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default ProtectedLayout;
