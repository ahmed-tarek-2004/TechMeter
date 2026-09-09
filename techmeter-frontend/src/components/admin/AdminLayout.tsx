import React, { useState } from 'react';
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
  ShieldAlert,
  Sun,
  Moon,
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Transactions', path: '/admin/transactions', icon: CreditCard },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-gray-300 flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Head */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-wide">TechMeter</span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">
                Admin
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link
            to="/"
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <Home className="h-4 w-4" />
            <span>Main Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="hidden sm:block">
            <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200">Platform Governance & Administration</h2>
          </div>

          <div className="flex items-center space-x-3">
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

            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.userName?.charAt(0) || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.userName || 'Administrator'}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
        </header>

        {/* Body outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
