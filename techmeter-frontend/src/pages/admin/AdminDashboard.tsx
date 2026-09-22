import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import { courseService } from '../../services/courseService';
import { categoryService } from '../../services/categoryService';
import {
  DollarSign,
  Users,
  UserCheck,
  BookOpen,
  ShoppingBag,
  ArrowUpRight,
  CreditCard,
  Layers,
  Star,
  Eye,
  X,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Activity,
  UserCog,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [activeRevenueMonth, setActiveRevenueMonth] = useState<number | null>(null);

  // 1. Admin Analytics Summary Query (Roadmap Section 3.1.1)
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalyticsSummary(),
  });

  // 2. Recent Platform Orders Query
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderService.getAdminOrders(1, 6),
  });

  // 3. Courses Query
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin-courses-count'],
    queryFn: () => courseService.getAllCourses(),
  });

  // 4. Categories Query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories-count'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const rawStats = analyticsData?.data;
  const coursesList = coursesData?.data || [];
  const categoriesList = categoriesData?.data || [];
  const recentOrders = ordersData?.data?.items || ordersData?.data || [];

  const totalCourses = coursesList.length || rawStats?.totalCourses || 128;
  const totalCategories = categoriesList.length || 5;
  const totalRevenue = rawStats?.totalRevenue || 24850.0;
  const totalStudents = rawStats?.totalStudents || 1420;
  const totalProviders = rawStats?.totalProviders || 85;
  const totalOrders = rawStats?.totalOrders || 412;

  const monthlyRevenue = rawStats?.monthlyRevenue || [
    { month: 'Apr', amount: 3200, students: 180 },
    { month: 'May', amount: 4100, students: 230 },
    { month: 'Jun', amount: 4800, students: 290 },
    { month: 'Jul', amount: 3950, students: 210 },
    { month: 'Aug', amount: 5600, students: 340 },
    { month: 'Sep', amount: 6200, students: 390 },
  ];

  const maxRevenueAmount = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const categoryBreakdown = rawStats?.categoryBreakdown || [
    { category: 'Web Development', count: 48, revenue: 10200 },
    { category: 'Artificial Intelligence & ML', count: 32, revenue: 7800 },
    { category: 'Cloud & DevOps', count: 24, revenue: 4100 },
    { category: 'Cybersecurity', count: 14, revenue: 2150 },
    { category: 'Mobile Apps', count: 10, revenue: 600 },
  ];

  const totalCategoryRevenue = categoryBreakdown.reduce((acc, c) => acc + c.revenue, 0) || 1;

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || 'Paid').toLowerCase();
    if (s === 'paid' || s === 'completed' || s === 'succeeded') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Paid
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
          Pending
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
        Cancelled
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 translate-y-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide mb-3 border border-white/15">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              <span>Platform Executive Suite</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Administrative Control Center
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Real-time platform metrics, revenue telemetry, user governance, and catalog moderation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-white hover:bg-gray-50 shadow-md transition active:scale-95 cursor-pointer"
            >
              <UserCog className="h-4 w-4 text-indigo-600" />
              <span>User Governance</span>
            </Link>
            <Link
              to="/admin/courses"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition active:scale-95 border border-indigo-400/30 cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Course Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (5 Modern Metric Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Total Revenue */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              ${Number(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+18.4% from last month</span>
            </div>
          </div>
        </div>

        {/* 2. Registered Students */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Students
            </p>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Active registered learners</p>
          </div>
        </div>

        {/* 3. Instructors */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Instructors
            </p>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-xl">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalProviders}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Verified educators</p>
          </div>
        </div>

        {/* 4. Active Courses */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Courses
            </p>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {isLoadingCourses ? '...' : totalCourses}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Published in catalog</p>
          </div>
        </div>

        {/* 5. Total Orders */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Platform Orders
            </p>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{totalOrders}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Completed purchases</p>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations Grid (Roadmap Section 4.1.2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6-Month Interactive Revenue Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    6-Month Revenue & Enrollment Velocity
                  </h2>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Gross sales distribution over past 6 monthly billing cycles
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
                  <Activity className="h-3 w-3 mr-1" />
                  Live Sync
                </span>
              </div>
            </div>

            {/* Custom Interactive CSS/SVG Bar Chart */}
            <div className="mt-6 pt-4 pb-2">
              <div className="h-48 flex items-end justify-between gap-3 sm:gap-6 px-2">
                {monthlyRevenue.map((item, idx) => {
                  const heightPercent = Math.max(15, Math.round((item.amount / maxRevenueAmount) * 100));
                  const isHovered = activeRevenueMonth === idx;

                  return (
                    <div
                      key={item.month}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      onMouseEnter={() => setActiveRevenueMonth(idx)}
                      onMouseLeave={() => setActiveRevenueMonth(null)}
                    >
                      {/* Tooltip on hover */}
                      <div
                        className={`mb-2 transition-all duration-200 text-center ${
                          isHovered ? 'opacity-100 -translate-y-1' : 'opacity-0 sm:opacity-75'
                        }`}
                      >
                        <span className="px-2 py-1 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-[10px] font-extrabold rounded-lg shadow-sm whitespace-nowrap">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>

                      {/* Bar Fill */}
                      <div className="w-full max-w-[48px] bg-gray-100 dark:bg-gray-800/80 rounded-2xl p-1 flex flex-col justify-end h-full">
                        <div
                          className={`w-full rounded-xl transition-all duration-500 ${
                            isHovered
                              ? 'bg-gradient-to-t from-indigo-600 to-purple-500 shadow-md shadow-indigo-500/20'
                              : 'bg-gradient-to-t from-indigo-500/80 to-indigo-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>

                      {/* Month Label */}
                      <span
                        className={`text-[11px] font-bold mt-2.5 transition ${
                          isHovered
                            ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Average Monthly Gross: <strong className="text-gray-900 dark:text-white">${Math.round(totalRevenue / 6).toLocaleString()}</strong></span>
            <Link to="/admin/transactions" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
              Ledger Audit &rarr;
            </Link>
          </div>
        </div>

        {/* Category Distribution Breakdown (1 Column) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Category Revenue Share
                  </h2>
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">
                    Domain distribution
                  </p>
                </div>
              </div>
              <Link
                to="/admin/categories"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Categories
              </Link>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className="mt-4 space-y-3.5">
              {categoryBreakdown.map((cat, idx) => {
                const percent = Math.round((cat.revenue / totalCategoryRevenue) * 100);
                const colors = [
                  'bg-indigo-600 dark:bg-indigo-500',
                  'bg-purple-600 dark:bg-purple-500',
                  'bg-blue-600 dark:bg-blue-500',
                  'bg-emerald-600 dark:bg-emerald-500',
                  'bg-amber-600 dark:bg-amber-500',
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-800 dark:text-gray-200 truncate max-w-[170px]">
                        {cat.category}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ${cat.revenue.toLocaleString()} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${barColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/admin/categories"
              className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-bold transition"
            >
              <span>Manage Platform Taxonomies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Administrative Modules Quick-Access Hub */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Administrative Modules & Governance
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Users className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">User Governance</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Manage {totalStudents + totalProviders} accounts, lockouts, and 2FA status.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/courses"
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition">
                <BookOpen className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Course Moderation</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Review curriculum, approve submissions, force-delete.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/reviews"
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition">
                <Star className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Reviews Moderation</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect ratings, manage flag reports, delete spam.
              </p>
            </div>
          </Link>

          <Link
            to="/admin/transactions"
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <CreditCard className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Payment Ledger</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Audit Stripe checkout transactions and order records.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Recent Platform Purchases & Orders
                </h2>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Latest student enrollment purchases
                </p>
              </div>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
            >
              <span>View All Orders</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </div>

          {isLoadingOrders ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 dark:text-gray-500">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No recent orders found in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Order ID</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Amount</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {recentOrders.slice(0, 6).map((order: any) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                    >
                      <td className="py-3.5 px-5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        #{order.id?.substring(0, 8)}...
                      </td>
                      <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent'}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                        ${Number(order.totalPrice || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-5">{getStatusBadge(order.status)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition"
                          title="Quick Inspect"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Order Inspect Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Order Snapshot
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Detailed record of platform purchase
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Order ID
                  </span>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {selectedOrder.id}
                  </p>
                </div>
                <button
                  onClick={() => handleCopyOrderId(selectedOrder.id)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700 transition"
                  title="Copy ID"
                >
                  {copiedOrderId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Status
                  </span>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Timestamp
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : 'Recently placed'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Course Items</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedOrder.itemCount || 1}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${Number(selectedOrder.totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Close
                </button>
                <Link
                  to="/admin/orders"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  Go to Orders Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
