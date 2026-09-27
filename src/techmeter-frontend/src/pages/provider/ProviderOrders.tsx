import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  X,
  Copy,
  Printer,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderOrders: React.FC = () => {
  const { user } = useAuth();
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Fetch provider orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['provider-orders', user?.id, pageNumber],
    queryFn: () => orderService.getProviderOrders(user?.id || '', pageNumber, pageSize),
    enabled: !!user?.id,
  });

  const rawOrders = useMemo(() => {
    return ordersData?.data?.items || [];
  }, [ordersData]);

  const totalPages = ordersData?.data?.totalPages || 1;
  const totalCount = ordersData?.data?.totalCount || ordersData?.data?.count || rawOrders.length;

  // Filtered orders (by search and status)
  const filteredOrders = useMemo(() => {
    return rawOrders.filter((order: any) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        !q ||
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.studentName && order.studentName.toLowerCase().includes(q)) ||
        (order.courseName && order.courseName.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter !== 'all') {
        return (order.status || 'paid').toLowerCase() === statusFilter.toLowerCase();
      }

      return true;
    });
  }, [rawOrders, searchTerm, statusFilter]);

  // Aggregate Metrics for Header
  const metrics = useMemo(() => {
    const totalVolume = rawOrders.reduce((sum: number, o: any) => sum + (Number(o.totalPrice) || 0), 0);
    const paidOrders = rawOrders.filter((o: any) => (o.status || 'paid').toLowerCase() === 'paid').length;
    const pendingOrders = rawOrders.filter((o: any) => (o.status || '').toLowerCase() === 'pending').length;

    return {
      totalVolume,
      paidOrders,
      pendingOrders,
      totalOrders: totalCount || rawOrders.length,
    };
  }, [rawOrders, totalCount]);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied to clipboard');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 sm:py-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Sales & Order Ledger
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Review and inspect enrollment checkouts, student purchases, and order records.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              Print Ledger
            </button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {metrics.totalOrders}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Sales Volume
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                ${metrics.totalVolume.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900/40 rounded-2xl text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Completed / Paid
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {metrics.paidOrders}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                Pending Clearance
              </p>
              <p className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {metrics.pendingOrders}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-gray-900 p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by Order ID, student name, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center space-x-1.5 bg-gray-50/80 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-600 dark:text-gray-300">
              <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer text-xs"
              >
                <option value="all" className="dark:bg-gray-800">All Statuses</option>
                <option value="paid" className="dark:bg-gray-800">Paid / Succeeded</option>
                <option value="pending" className="dark:bg-gray-800">Pending</option>
                <option value="cancelled" className="dark:bg-gray-800">Cancelled</option>
                <option value="refunded" className="dark:bg-gray-800">Refunded</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/70 transition"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Orders Table Container */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="p-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto" />
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Loading sales records...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center max-w-sm mx-auto">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-indigo-600 dark:text-indigo-400">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {searchTerm || statusFilter !== 'all' ? 'No matching sales found' : 'No sales orders yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try changing your filter settings to find what you are looking for.'
                  : 'When learners purchase and enroll in your courses, their orders will appear here.'}
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Order ID</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Student / Buyer</th>
                    <th className="py-3.5 px-6">Items</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {filteredOrders.map((order: any, idx: number) => {
                    const status = (order.status || 'paid').toLowerCase();
                    return (
                      <tr
                        key={order.id || idx}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition"
                      >
                        <td className="py-4 px-6 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          <div className="flex items-center space-x-1.5">
                            <span>#{order.id?.substring(0, 10)}...</span>
                            <button
                              onClick={() => handleCopyOrderId(order.id)}
                              className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                              title="Copy Order ID"
                              aria-label="Copy Order ID"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'Recent'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              {(order.studentName || 'S').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {order.studentName || 'Student Buyer'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium">
                          {order.itemCount || 1} course(s)
                        </td>
                        <td className="py-4 px-6 font-black text-gray-900 dark:text-white">
                          ${(Number(order.totalPrice) || 0).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              status === 'paid' || status === 'succeeded'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                : status === 'pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                                : status === 'refunded'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                            }`}
                          >
                            {status === 'paid' || status === 'succeeded' ? (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            ) : status === 'pending' ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {order.status || 'Paid'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 text-gray-700 dark:text-gray-200 rounded-xl text-xs font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                Showing page {pageNumber} of {totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((p) => p + 1)}
                  className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Order Details
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  #{selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-gray-50/80 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Purchase Date
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedOrder.createdAt
                      ? new Date(selectedOrder.createdAt).toLocaleString()
                      : 'Recent Transaction'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Payment Status
                  </span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 capitalize">
                    {selectedOrder.status || 'Paid'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Purchased By
                  </span>
                  <p className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                    {selectedOrder.studentName || 'Student Learner'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-semibold">
                    Total Amount
                  </span>
                  <p className="font-black text-gray-900 dark:text-white mt-0.5 text-sm">
                    ${(Number(selectedOrder.totalPrice) || 0).toFixed(2)} USD
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Included Courses / Items:
                </span>
                <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {selectedOrder.courseName || `${selectedOrder.itemCount || 1} Enrolled Course Module(s)`}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    ${(Number(selectedOrder.totalPrice) || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyOrderId(selectedOrder.id)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy ID
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderOrders;
