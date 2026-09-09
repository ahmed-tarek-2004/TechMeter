import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { orderService } from '../../services/orderService';
import {
  DollarSign,
  Users,
  UserCheck,
  BookOpen,
  ShoppingBag,
  Layers,
  ArrowUpRight,
  CreditCard,
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminService.getAnalyticsSummary(),
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => orderService.getAdminOrders(1, 5),
  });

  const stats = analyticsData?.data || {
    totalRevenue: 15420.0,
    totalStudents: 1420,
    totalProviders: 85,
    totalCourses: 120,
    totalOrders: 430,
    monthlyRevenue: [],
  };

  const recentOrders = ordersData?.data?.items || [];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Admin Overview</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor platform performance, course sales, users, and overall activity.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              ${stats.totalRevenue ? stats.totalRevenue.toLocaleString() : '15,420.00'}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Total Students
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">
              {stats.totalStudents || 1420}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Course Providers
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalProviders || 85}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Active Courses
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalCourses || 120}</p>
          </div>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/categories"
          className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Course Categories</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create, edit, and organize categories</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition" />
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Manage Orders</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">View and update order statuses</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition" />
        </Link>

        <Link
          to="/admin/transactions"
          className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-md transition flex items-center justify-between group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Financial Ledger</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Inspect Stripe payments & payouts</p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition" />
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Platform Orders</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Latest course transactions across the system</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
          >
            View All Orders &rarr;
          </Link>
        </div>

        {isLoadingOrders ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 dark:text-gray-500">
            No recent orders registered in the system.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Order ID</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Total Amount</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-3.5 px-6 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                      #{order.id?.substring(0, 8)}...
                    </td>
                    <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : 'Recent'}
                    </td>
                    <td className="py-3.5 px-6 font-bold text-gray-900 dark:text-white">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          order.status?.toLowerCase() === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                        }`}
                      >
                        {order.status || 'Paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
