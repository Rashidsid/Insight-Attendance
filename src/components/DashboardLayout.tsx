import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Users, UserPlus, GraduationCap, FileText, Camera, ClipboardList, LogOut, Settings, User, ChevronDown } from 'lucide-react';
import { useSearch } from '../contexts/SearchContext';
import GlobalSearchBar from './GlobalSearchBar';
import { getThemeFromStorage, getLogoFromStorage, applyTheme } from '../services/themeService';

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarBg, setSidebarBg] = useState('#E7D7F6');
  const [sidebarAccent, setSidebarAccent] = useState('#A982D9');
  const [buttonHoverBg, setButtonHoverBg] = useState('rgba(255, 255, 255, 0.5)');
  const [logo, setLogo] = useState('/images/admin.png');
  const isAdminRoute = location.pathname.includes('/admin/face-recognition') || location.pathname.includes('/admin/attendance-result') ? false : true;

  // Load theme on component mount
  useEffect(() => {
    const theme = getThemeFromStorage();
    setSidebarBg(theme.sidebarBg);
    setSidebarAccent(theme.sidebarAccent);
    setButtonHoverBg(theme.buttonHoverBg);
    
    const adminEmail = localStorage.getItem('adminEmail');
    if (adminEmail) {
      const storedLogo = getLogoFromStorage(adminEmail);
      if (storedLogo) {
        setLogo(storedLogo);
      } else if (theme.logo) {
        setLogo(theme.logo);
      }
    } else if (theme.logo) {
      setLogo(theme.logo);
    }
    
    applyTheme(theme);
  }, []);

  // Reload theme when returning from settings page
  useEffect(() => {
    const loadTheme = () => {
      const theme = getThemeFromStorage();
      setSidebarBg(theme.sidebarBg);
      setSidebarAccent(theme.sidebarAccent);
      setButtonHoverBg(theme.buttonHoverBg);
      
      const adminEmail = localStorage.getItem('adminEmail');
      if (adminEmail) {
        const storedLogo = getLogoFromStorage(adminEmail);
        if (storedLogo) {
          setLogo(storedLogo);
        } else if (theme.logo) {
          setLogo(theme.logo);
        }
      } else if (theme.logo) {
        setLogo(theme.logo);
      }
      
      applyTheme(theme);
    };
    
    loadTheme();
  }, [location.pathname]);

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
      <div className="w-[280px] flex flex-col" style={{ backgroundColor: sidebarBg }}>
        <div className="p-4">
          <div className="flex items-center justify-center mb-8">
            <img src={logo} alt="Admin Panel" className="w-45 h-45 object-contain rounded-xl" />
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
                      ? 'text-white'
                      : 'text-gray-700'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: sidebarAccent, color: 'white' }
                      : { backgroundColor: 'transparent' }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.backgroundColor = buttonHoverBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLElement).style.backgroundColor = 'transparent';
                    }
                  }}
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
          <div className="w-[600px]">
            <GlobalSearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Admin Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: sidebarAccent }}
              >
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
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <div className="border-t border-gray-200 my-2"></div>
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