import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import {
  Search,
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ShoppingBag,
  DollarSign,
  Clock,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [pageNumber, setPageNumber] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [orderToDelete, setOrderToDelete] = useState<{ id: string } | null>(null);

  // Status Update Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState('Paid');

  // Quick View Order Modal State
  const [previewOrder, setPreviewOrder] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Fetch Admin Orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', pageNumber, statusFilter],
    queryFn: () => orderService.getAdminOrders(pageNumber, 10, statusFilter || undefined),
  });

  const orders = ordersData?.data?.items || [];
  const totalPages = ordersData?.data?.totalPages || 1;
  const totalCount = ordersData?.data?.totalCount || orders.length;

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      orderService.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast.success('Order status updated successfully!');
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
      if (previewOrder) setPreviewOrder(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to update order status.';
      toast.error(msg);
    },
  });

  // Delete Order Mutation
  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => orderService.deleteOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-recent-orders'] });
      toast.success('Order record removed from platform.');
      setOrderToDelete(null);
      if (previewOrder) setPreviewOrder(null);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to delete order record.';
      toast.error(msg);
      setOrderToDelete(null);
    },
  });

  const handleOpenStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'Paid');
    setIsStatusModalOpen(true);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filteredOrders = orders.filter((o: any) =>
    o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    const s = (status || 'Paid').toLowerCase();
    if (s === 'paid') {
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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-gray-800/80">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Platform Orders
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
              <ShoppingBag className="h-3 w-3 mr-1" />
              Order Management
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review all purchase transactions, manage fulfillment statuses, and assist customer inquiries.
          </p>
        </div>
      </div>

      {/* Orders Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 border border-purple-100 dark:border-purple-900/40 rounded-2xl text-purple-600 dark:text-purple-400">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Total Recorded
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {totalCount}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Paid Transactions
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {orders.filter((o: any) => o.status?.toLowerCase() === 'paid').length} on page
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-amber-600 dark:text-amber-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Pending Orders
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              {orders.filter((o: any) => o.status?.toLowerCase() === 'pending').length} on page
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4.5 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Page Volume
            </p>
            <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
              ${orders.reduce((acc: number, o: any) => acc + (o.totalPrice || 0), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by Order ID or Student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs transition"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5 bg-gray-50/50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300">
            <Filter className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(1);
              }}
              className="bg-transparent focus:outline-none text-xs text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              <option value="" className="dark:bg-gray-800">All Statuses</option>
              <option value="Paid" className="dark:bg-gray-800">Paid</option>
              <option value="Pending" className="dark:bg-gray-800">Pending</option>
              <option value="Refunded" className="dark:bg-gray-800">Refunded</option>
              <option value="Cancelled" className="dark:bg-gray-800">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">No orders found</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 max-w-sm mx-auto">
              {searchTerm || statusFilter
                ? 'Try adjusting your search query or status filter.'
                : 'No order records are currently registered on the platform.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Student ID</th>
                  <th className="py-3.5 px-6">Items</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                {filteredOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                    <td className="py-4 px-6 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      #{order.id?.substring(0, 10)}...
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Recent'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                          {order.studentId ? order.studentId.substring(0, 2).toUpperCase() : 'ST'}
                        </div>
                        <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400">
                          {order.studentId ? `${order.studentId.substring(0, 8)}...` : 'Anonymous'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium">
                      {order.itemCount || 1} course(s)
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900 dark:text-white">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="py-4 px-6 text-right space-x-1.5">
                      <button
                        onClick={() => setPreviewOrder(order)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(order)}
                        className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                        title="Change Status"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setOrderToDelete({ id: order.id })}
                        className="p-2 text-rose-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        title="Delete Order Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              Page {pageNumber} of {totalPages} ({totalCount} total orders)
            </span>
            <div className="flex space-x-2">
              <button
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Update Order Status</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <p className="font-mono text-gray-500 dark:text-gray-400">
                Order #{selectedOrder?.id?.substring(0, 16)}
              </p>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="Paid" className="dark:bg-gray-800">Paid (Completed)</option>
                  <option value="Pending" className="dark:bg-gray-800">Pending (Awaiting Settlement)</option>
                  <option value="Cancelled" className="dark:bg-gray-800">Cancelled</option>
                  <option value="Refunded" className="dark:bg-gray-800">Refunded</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatusMutation.mutate({
                      orderId: selectedOrder.id,
                      status: newStatus,
                    })
                  }
                  disabled={updateStatusMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Quick View Modal */}
      {previewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Order Details</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Platform Transaction Audit</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewOrder(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Order ID</span>
                  <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{previewOrder.id}</p>
                </div>
                <button
                  onClick={() => handleCopy(previewOrder.id)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700 transition"
                >
                  {copiedId ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Status</span>
                  <div className="mt-1">{getStatusBadge(previewOrder.status)}</div>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Placed Date</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-1">
                    {previewOrder.createdAt
                      ? new Date(previewOrder.createdAt).toLocaleDateString()
                      : 'Recent'}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Student ID:</span>
                  <span className="font-mono text-gray-800 dark:text-gray-200">
                    {previewOrder.studentId || 'Anonymous'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Items Enrolled:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {previewOrder.itemCount || 1} course(s)
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                  <span>Gross Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ${previewOrder.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => {
                    handleOpenStatusModal(previewOrder);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl transition"
                >
                  Change Status
                </button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewOrder(null)}
                    className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={() => {
          if (orderToDelete) {
            deleteMutation.mutate(orderToDelete.id);
          }
        }}
        title="Delete Order Record"
        message={`Are you sure you want to permanently delete order record #${orderToDelete?.id}? This action cannot be reverted and will remove the transaction from records.`}
        confirmText="Delete Record"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminOrders;
