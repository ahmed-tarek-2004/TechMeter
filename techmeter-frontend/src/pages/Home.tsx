import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TechMarquee from '../components/home/TechMarquee';
import AmbientBackground from '../components/home/AmbientBackground';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  Search,
  BookOpen,
  PlusCircle,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ShoppingBag,
  MessageSquare,
  Bookmark,
  Code2,
  Server,
  Cloud,
  Cpu,
  Smartphone,
  Shield,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/courses?search=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/courses');
    }
  };

  const isStudent = isAuthenticated && user?.role === 'student';
  const isProvider = isAuthenticated && user?.role === 'provider';
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isGuest = !isAuthenticated;

  return (
    <div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      {/* 1. HERO SECTION WITH AMBIENT BACKGROUND */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden text-gray-900 dark:text-white min-h-[520px] flex items-center justify-center">
        {/* Ambient Moving Interactive Canvas Background */}
        <AmbientBackground particleCount={55} interactive={true} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 text-center space-y-7">
          {/* Role-Specific Welcome Tag */}
          <div className="flex justify-center">
            {isStudent && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-300 backdrop-blur-md shadow-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Welcome back, {user?.fullName || user?.userName} • Student</span>
              </div>
            )}

            {isProvider && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-400/30 text-purple-600 dark:text-purple-300 backdrop-blur-md shadow-xs">
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-500" />
                <span>Instructor Workspace • {user?.fullName || user?.userName}</span>
              </div>
            )}

            {isAdmin && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 text-emerald-600 dark:text-emerald-300 backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Administrator Panel</span>
              </div>
            )}

            {isGuest && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-400/30 text-indigo-600 dark:text-indigo-300 backdrop-blur-md shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Next-Gen Engineering &amp; Tech Education</span>
              </div>
            )}
          </div>

          {/* Main Headline (Preserved exactly as requested) */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-[1.1]">
            Master In-Demand <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 dark:from-indigo-400 dark:via-purple-300 dark:to-sky-400">
              Tech Skills.
            </span>
          </h1>

          {/* Role-Specific Subtext */}
          <p className="text-base sm:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isStudent
              ? 'Continue your engineering journey, explore new technical tracks, and advance your hands-on coding skills.'
              : isProvider
              ? 'Manage your published courses, engage with enrolled students in real-time, and publish new curriculums.'
              : 'Step into software engineering, AI, and cloud architecture with hands-on projects and verified credentials.'}
          </p>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-gray-400 dark:text-slate-400" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Search courses, skills, or topics..."
                className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 backdrop-blur-md border border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl dark:shadow-2xl transition"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Action Buttons: State-aware */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            {/* 1. Student Actions */}
            {isStudent && (
              <>
                <Link
                  to="/my-learning"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:translate-x-0.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>My Learning</span>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}

            {/* 2. Provider Actions */}
            {isProvider && (
              <>
                <Link
                  to="/provider/dashboard"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:translate-x-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Instructor Dashboard</span>
                </Link>
                <Link
                  to="/courses/create"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-500" />
                  <span>Create Course</span>
                </Link>
              </>
            )}

            {/* 3. Admin Actions */}
            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:translate-x-0.5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <span>View Courses</span>
                </Link>
              </>
            )}

            {/* 4. Guest Actions */}
            {isGuest && (
              <>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-600/30 transition hover:translate-x-0.5"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-indigo-600 dark:text-white border border-indigo-200 dark:border-white/20 text-xs sm:text-sm font-bold backdrop-blur-md shadow-xs transition"
                >
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. TECH STACK MARQUEE */}
      <TechMarquee />

      {/* 3. DYNAMIC ROLE-BASED HUB / TRACKS SECTION (Replaces heavy explore courses list) */}
      <section className="py-16 bg-gray-50/60 dark:bg-gray-900/40 border-b border-gray-100 dark:border-gray-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/50 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {isStudent
                  ? 'Your Learning Hub'
                  : isProvider
                  ? 'Instructor Studio'
                  : isAdmin
                  ? 'Management Center'
                  : 'Core Learning Tracks'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {isStudent
                ? 'Quick Access & Continuous Learning'
                : isProvider
                ? 'Everything to Teach & Scale'
                : isAdmin
                ? 'Platform Control Hub'
                : 'Choose Your Engineering Track'}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {isStudent
                ? 'Directly jump back into your coursework, saved topics, or reach out to mentors.'
                : isProvider
                ? 'Manage your content, monitor enrollments, and engage with your students.'
                : isAdmin
                ? 'Control catalog entries, verify user roles, and monitor transactions.'
                : 'Focused curriculums designed to help you master real-world tech stacks.'}
            </p>
          </div>

          {/* Cards Grid: Student Mode */}
          {isStudent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/my-learning"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    My Learning
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Resume your enrolled courses, watch video lessons, and track module completions.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Continue Learning</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/courses"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    Explore Catalog
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Discover new courses across fullstack development, AI, cloud architecture, and DevOps.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Browse Courses</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/wishlist"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                    Saved Wishlist
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    View courses you have bookmarked to enroll and learn at your own pace.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <span>View Wishlist</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/messages"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Instructor Messages
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Direct real-time communication with course instructors for technical support and feedback.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Open Messages</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          )}

          {/* Cards Grid: Provider Mode */}
          {isProvider && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/provider/dashboard"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Instructor Dashboard
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Access course statistics, recent reviews, rating summaries, and performance overview.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/courses/create"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <PlusCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Publish New Course
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Upload video lectures, structure learning sections, set pricing, and publish curriculums.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Create Course</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/provider/orders"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    Sales &amp; Orders
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Track student enrollments, order summaries, revenue distributions, and transaction records.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>View Sales</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/messages"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    Student Inquiries
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Chat with students enrolled in your courses, answer technical queries, and share insights.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <span>Open Messages</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          )}

          {/* Cards Grid: Admin Mode */}
          {isAdmin && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/admin/dashboard"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <LayoutDashboard className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Admin Dashboard
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    High-level platform stats, revenue figures, user metrics, and overview charts.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Open Console</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/admin/courses"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    Course Moderation
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Review published courses, manage instructor curriculums, and verify content standards.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Manage Courses</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/admin/categories"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    Categories &amp; Tracks
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Create, update, and manage technical course categories across the entire platform.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Manage Categories</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              <Link
                to="/admin/orders"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-sky-400 dark:hover:border-sky-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-900/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    Platform Orders
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Monitor all student checkout orders, verify payment states, and track fulfillment.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                  <span>View Orders</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          )}

          {/* Cards Grid: Guest Mode (Learning Domains / Tracks) */}
          {isGuest && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Track 1: Frontend */}
              <Link
                to="/courses?search=Frontend"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                    Frontend &amp; Modern Web
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Master modern UI architectures with React 19, Next.js, TypeScript, and state management.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Track 2: Backend */}
              <Link
                to="/courses?search=Backend"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    Backend &amp; Microservices
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Build scalable enterprise backends with .NET Core, Node.js, Clean Architecture, and REST/gRPC.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Track 3: Cloud & DevOps */}
              <Link
                to="/courses?search=DevOps"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                    Cloud &amp; DevOps Engineering
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Automate deployments with Docker, Kubernetes, CI/CD pipelines, and cloud native architectures.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Track 4: AI & ML */}
              <Link
                to="/courses?search=AI"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                    AI &amp; Machine Learning
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Train neural networks, build LLM-powered applications, and deploy real-world machine learning models.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Track 5: Mobile Development */}
              <Link
                to="/courses?search=Mobile"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-cyan-400 dark:hover:border-cyan-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                    Mobile App Engineering
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Build cross-platform iOS and Android apps with React Native and Flutter with native performance.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>

              {/* Track 6: Cybersecurity */}
              <Link
                to="/courses?search=Security"
                className="group p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition duration-200">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition">
                    Security &amp; Authentication
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Learn secure authentication, Two-Factor OTP flows, authorization architectures, and pentesting.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* 4. MINIMAL CTA BANNER (Adapted for role) */}
      <section className="relative py-20 text-gray-900 dark:text-white overflow-hidden flex items-center">
        <AmbientBackground particleCount={35} interactive={false} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 z-10 w-full">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white max-w-xl mx-auto">
            {isStudent
              ? 'Ready to continue your next lesson?'
              : isProvider
              ? 'Ready to share your expertise?'
              : isAdmin
              ? 'Maintain and optimize TechMeter'
              : 'Ready to level up your tech career?'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
            {isStudent
              ? 'Jump back into your curriculum or browse new skills to learn.'
              : isProvider
              ? 'Create a new course or manage your students directly.'
              : isAdmin
              ? 'Review pending orders, categories, and published courses.'
              : 'Join TechMeter to master in-demand technical skills with hands-on practice.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {isStudent && (
              <Link
                to="/my-learning"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-bold shadow-md transition"
              >
                <span>Go to My Learning</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            {isProvider && (
              <Link
                to="/courses/create"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-bold shadow-md transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Course</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-bold shadow-md transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Admin Panel</span>
              </Link>
            )}

            {isGuest && (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-indigo-600 dark:bg-white text-white dark:text-indigo-950 hover:bg-indigo-700 dark:hover:bg-gray-100 text-xs sm:text-sm font-bold shadow-md transition"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/courses"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-white dark:bg-indigo-600 hover:bg-gray-50 dark:hover:bg-indigo-500 text-gray-900 dark:text-white border border-gray-200 dark:border-indigo-400/40 text-xs sm:text-sm font-bold shadow-xs transition"
                >
                  <span>Browse Courses</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
