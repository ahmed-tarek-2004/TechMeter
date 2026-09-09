import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ProviderOrders: React.FC = () => {
  const { user } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['provider-orders', user?.id, pageNumber],
    queryFn: () => orderService.getProviderOrders(user?.id || '', pageNumber, 10),
    enabled: !!user?.id,
  });

  const orders = ordersData?.data?.items || [];
  const totalPages = ordersData?.data?.totalPages || 1;

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.studentName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter !== 'all') {
      return order.status?.toLowerCase() === statusFilter.toLowerCase();
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Sales & Orders</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Monitor students who enrolled and purchased your courses.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by order ID or student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300">
              <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="dark:bg-gray-800">All Statuses</option>
                <option value="paid" className="dark:bg-gray-800">Paid</option>
                <option value="pending" className="dark:bg-gray-800">Pending</option>
                <option value="cancelled" className="dark:bg-gray-800">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">No sales orders found</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                When students purchase your courses, they will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                      <td className="py-4 px-6 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        #{order.id?.substring(0, 8)}...
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">
                        {order.itemCount || 1} course(s)
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                        ${order.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status?.toLowerCase() === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                              : order.status?.toLowerCase() === 'pending'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Page {pageNumber} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderOrders;
