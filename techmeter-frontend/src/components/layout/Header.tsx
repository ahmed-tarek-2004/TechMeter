import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  BookOpen,
  LogOut,
  Heart,
  MessageSquare,
  ShieldAlert,
  PlayCircle,
  Layers,
  DollarSign,
  Users,
  Sun,
  Moon,
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const role = user?.role?.toLowerCase();

  return (
    <header className="bg-white dark:bg-gray-900 shadow-xs sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-600 rounded-xl text-white shadow-xs">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">TechMeter</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl leading-5 bg-gray-50/80 dark:bg-gray-800 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs transition"
                placeholder="Search courses, skills, and topics..."
              />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <Link
              to="/courses"
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-xs font-semibold transition"
            >
              Explore Courses
            </Link>

            {isAuthenticated && role === 'student' && (
              <Link
                to="/my-learning"
                className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-xs font-semibold flex items-center space-x-1 transition"
              >
                <PlayCircle className="h-4 w-4 text-indigo-500" />
                <span>My Learning</span>
              </Link>
            )}

            {isAuthenticated && role === 'provider' && (
              <Link
                to="/provider/dashboard"
                className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
              >
                <Layers className="h-4 w-4" />
                <span>Instructor Hub</span>
              </Link>
            )}

            {isAuthenticated && role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Night / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4.5 w-4.5 text-amber-400 transition-transform" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-gray-600 dark:text-gray-400 transition-transform" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                {role === 'student' && (
                  <>
                    <Link
                      to="/cart"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                      title="Cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </Link>

                    <Link
                      to="/wishlist"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                      title="Wishlist"
                    >
                      <Heart className="h-5 w-5" />
                    </Link>
                  </>
                )}

                <Link
                  to="/messages"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                  title="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>

                <Link
                  to="/notifications"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Profile Dropdown */}
                <div className="relative ml-2">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition focus:outline-none"
                  >
                    {user?.profileUrl ? (
                      <img
                        src={user.profileUrl}
                        alt={user.userName}
                        className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                        {user?.userName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl py-2 border border-gray-100 dark:border-gray-700 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.userName}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-400 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User className="h-4 w-4 mr-2.5 text-gray-400" />
                          My Profile
                        </Link>

                        {role === 'student' && (
                          <>
                            <Link
                              to="/my-learning"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <PlayCircle className="h-4 w-4 mr-2.5 text-indigo-500" />
                              My Learning
                            </Link>
                            <Link
                              to="/orders"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2.5 text-gray-400" />
                              My Orders
                            </Link>
                          </>
                        )}

                        {role === 'provider' && (
                          <>
                            <Link
                              to="/provider/dashboard"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Layers className="h-4 w-4 mr-2.5 text-indigo-500" />
                              Dashboard & Courses
                            </Link>
                            <Link
                              to="/courses/create"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <BookOpen className="h-4 w-4 mr-2.5 text-gray-400" />
                              Create Course
                            </Link>
                            <Link
                              to="/provider/orders"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2.5 text-gray-400" />
                              Sales & Orders
                            </Link>
                            <Link
                              to="/provider/transactions"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <DollarSign className="h-4 w-4 mr-2.5 text-emerald-500" />
                              Earnings & Payouts
                            </Link>
                            <Link
                              to="/provider/students"
                              className="flex items-center px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                              onClick={() => setIsProfileOpen(false)}
                            >
                              <Users className="h-4 w-4 mr-2.5 text-gray-400" />
                              Enrolled Students
                            </Link>
                          </>
                        )}

                        {role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <ShieldAlert className="h-4 w-4 mr-2.5 text-purple-600" />
                            Admin Console
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                        >
                          <LogOut className="h-4 w-4 mr-2.5 text-rose-500" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-xs font-semibold transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu & Dark toggle */}
          <div className="md:hidden flex items-center space-x-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-4 space-y-2">
          <form onSubmit={handleSearch} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              placeholder="Search courses..."
            />
          </form>

          <Link
            to="/courses"
            className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(false)}
          >
            Explore Courses
          </Link>

          {isAuthenticated ? (
            <>
              {role === 'student' && (
                <>
                  <Link
                    to="/my-learning"
                    className="block py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Learning
                  </Link>
                  <Link
                    to="/cart"
                    className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/orders"
                    className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                </>
              )}

              {role === 'provider' && (
                <>
                  <Link
                    to="/provider/dashboard"
                    className="block py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Instructor Dashboard
                  </Link>
                  <Link
                    to="/provider/orders"
                    className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sales & Orders
                  </Link>
                  <Link
                    to="/provider/transactions"
                    className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Earnings & Payouts
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="block py-2 text-xs font-bold text-purple-700 dark:text-purple-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}

              <Link
                to="/messages"
                className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Messages
              </Link>
              <Link
                to="/notifications"
                className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Notifications
              </Link>
              <Link
                to="/profile"
                className="block py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left py-2 text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                className="block text-center py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="block text-center py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
