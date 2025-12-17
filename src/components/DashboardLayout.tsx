import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Users, UserPlus, GraduationCap, FileText, Camera, ClipboardList, LogOut, Search, Settings, User, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { useSearch } from '../contexts/SearchContext';

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isAdminRoute = location.pathname.includes('/admin/face-recognition') || location.pathname.includes('/admin/attendance-result') ? false : true;

  const adminMenuItems = [
    { icon: Users, label: 'Student List', path: '/admin/students' },
    { icon: UserPlus, label: 'Add Student', path: '/admin/students/add' },
    { icon: GraduationCap, label: 'Teacher List', path: '/admin/teachers' },
    { icon: UserPlus, label: 'Add Teacher', path: '/admin/teachers/add' },
    { icon: Settings, label: 'Manage Classes', path: '/admin/manage-classes' },
    { icon: Settings, label: 'Manage Subjects', path: '/admin/manage-subjects' },
    { icon: FileText, label: 'Reports', path: '/admin/reports' },
  ];

  const userMenuItems = [
    { icon: Camera, label: 'Face Recognition', path: '/admin/face-recognition' },
    { icon: ClipboardList, label: 'Attendance Result', path: '/admin/attendance-result' },
  ];

  const menuItems = isAdminRoute ? adminMenuItems : userMenuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-[280px] bg-[#E7D7F6] flex flex-col">
        <div className="p-4">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/admin.png" alt="Admin Panel" className="w-45 h-45 object-contain rounded-xl" />
          </div>

          <nav className="space-y-5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#A982D9] text-white'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 hidden"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-[90px] bg-white border-b border-gray-200 px-8 flex items-center justify-between">
          <div className="relative w-[600px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search students, teachers, or records..."
              className="h-12 pl-12 rounded-xl border-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-[#A982D9] rounded-full flex items-center justify-center text-white">
                <User className="w-5 h-5" />
              </div>
              <span className="text-gray-700 font-medium">Admin</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    // Clear all auth data
                    localStorage.removeItem('isAdminLoggedIn');
                    localStorage.removeItem('adminEmail');
                    localStorage.removeItem('rememberAdmin');
                    // Redirect to login
                    navigate('/admin/login');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}