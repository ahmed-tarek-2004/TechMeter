import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Layers,
  BookOpen,
  ShoppingBag,
  CreditCard,
  Star,
  LogOut,
  Home,
  Menu,
  X,
  ShieldCheck,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Activity,
  Bell,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
    } catch {
      // Ignore localStorage errors
    }
  }, [isCollapsed]);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'Categories', path: '/admin/categories', icon: Layers, badge: null },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen, badge: null },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag, badge: null },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard, badge: null },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star, badge: null },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/admin/dashboard')) return 'Platform Overview';
    if (location.pathname.includes('/admin/categories')) return 'Category Management';
    if (location.pathname.includes('/admin/courses')) return 'Course Catalog & Moderation';
    if (location.pathname.includes('/admin/orders')) return 'Platform Order Records';
    if (location.pathname.includes('/admin/transactions')) return 'Financial Ledger & Payouts';
    if (location.pathname.includes('/admin/reviews')) return 'Review & Feedback Moderation';
    return 'Admin Panel';
  };

  return (
    <div className="min-h-screen bg-gray-50/80 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-gray-900 border-r border-gray-800 text-gray-300 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Head */}
        <div className="h-16 px-4 border-b border-gray-800 flex items-center justify-between">
          <Link
            to="/admin/dashboard"
            className={`flex items-center space-x-3 overflow-hidden ${
              isCollapsed ? 'justify-center w-full' : ''
            }`}
          >
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl text-white shadow-xs flex-shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-base font-black text-white tracking-tight">TechMeter</span>
                <span className="ml-1.5 text-[9px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded-md">
                  Admin
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Management
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                title={isCollapsed ? item.name : undefined}
                className={`group flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-2.5'
                } rounded-2xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-indigo-900/30 shadow-md font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-indigo-400'
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle Button */}
        <div className="hidden lg:flex px-3 py-2 border-t border-gray-800 justify-end">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-xs transition"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center space-x-2 text-[11px] font-medium text-gray-400">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </div>
            )}
          </button>
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            to="/"
            className={`flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3.5 py-2'
            } rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition`}
            title={isCollapsed ? 'Main Website' : undefined}
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Main Website</span>}
          </Link>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3.5 py-2'
            } rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition`}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200 sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              aria-label="Open Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500">
                <span>Admin</span>
                <span>/</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{getPageTitle()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Operational Status */}
            <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Activity className="h-3.5 w-3.5 ml-0.5" />
              <span>Services Online</span>
            </div>

            {/* Notifications Shortcut */}
            <Link
              to="/notifications"
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
            </Link>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Admin User Avatar Pill */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                {user?.userName?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                  {user?.userName || 'Administrator'}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                  {user?.email || 'admin@techmeter.com'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Body Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
