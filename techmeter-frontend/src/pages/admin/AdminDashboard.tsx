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
  Clock,
  Plus,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Analytics summary query
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalyticsSummary(),
  });

  // Recent orders query
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderService.getAdminOrders(1, 6),
  });

  // Courses query for real counts
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: ['admin-courses-count'],
    queryFn: () => courseService.getAllCourses(),
  });

  // Categories query
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-categories-count'],
    queryFn: () => categoryService.getAllCategories(),
  });

  const rawStats = analyticsData?.data;
  const coursesList = coursesData?.data || [];
  const categoriesList = categoriesData?.data || [];
  const recentOrders = ordersData?.data?.items || ordersData?.data || [];

  const totalCourses = coursesList.length || rawStats?.totalCourses || 0;
  const totalCategories = categoriesList.length;
  const totalRevenue = rawStats?.totalRevenue || 0;
  const totalStudents = rawStats?.totalStudents || 0;
  const totalProviders = rawStats?.totalProviders || 0;

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
    if (s === 'refunded') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></span>
          Refunded
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
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 translate-y-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide mb-3 border border-white/15">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              <span>Executive Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Platform Administration
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Oversee the learning catalog, manage categories, moderate platform reviews, and inspect student transactions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/categories"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-white hover:bg-gray-50 shadow-md transition active:scale-95"
            >
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Manage Categories</span>
            </Link>
            <Link
              to="/admin/courses"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md transition active:scale-95 border border-indigo-400/30"
            >
              <BookOpen className="h-4 w-4" />
              <span>Course Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Clean KPI Cards Grid (4 Real Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* 1. Total Revenue */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              ${Number(totalRevenue).toFixed(2)}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* 2. Total Students */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Registered Students
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {totalStudents}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* 3. Instructors */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Course Instructors
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {totalProviders}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-900/50 rounded-2xl text-purple-600 dark:text-purple-400">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* 4. Active Courses */}
        <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Courses
            </p>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mt-1">
              {isLoadingCourses ? '...' : totalCourses}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50 rounded-2xl text-blue-600 dark:text-blue-400">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Quick Administrative Operations */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Administrative Modules
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/categories"
            className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-md transition group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Layers className="h-5 w-5" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
            </div>
            <div className="mt-3">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Course Categories</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Create, edit, and organize platform learning domains.
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
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Course Catalog</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect curriculum, review pricing, and moderate courses.
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
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Reviews & Feedback</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Inspect course ratings and manage student reviews.
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

      {/* 2-Column Section: Real Categories Overview & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* Categories Overview Card (1 Column) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Platform Categories
                  </h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {totalCategories} active learning categories
                  </p>
                </div>
              </div>
              <Link
                to="/admin/categories"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
              >
                Manage <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </div>

            {isLoadingCategories ? (
              <div className="py-10 text-center text-xs text-gray-400 dark:text-gray-500">
                Loading categories...
              </div>
            ) : categoriesList.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400 dark:text-gray-500">
                No categories created yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 mt-2">
                {categoriesList.slice(0, 6).map((category: any) => (
                  <div
                    key={category.id}
                    className="py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-2 rounded-2xl transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1">
                          {category.description || 'No description'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              to="/admin/categories"
              className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 rounded-2xl text-xs font-bold transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add or Edit Categories</span>
            </Link>
          </div>
        </div>

        {/* Recent Orders Table (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Recent Platform Orders
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
                <span>View All</span>
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
                      <th className="py-3.5 px-5">Order</th>
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
                        <td className="py-3.5 px-5">
                          {getStatusBadge(order.status)}
                        </td>
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

          <div className="p-4 bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 text-center">
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Access Full Orders Ledger &rarr;
            </Link>
          </div>
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
              {/* Order ID Bar */}
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

              {/* Order Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                    Order Status
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

              {/* Financial Breakdown */}
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

              {/* Actions Footer */}
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
                  Go to Orders Page
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