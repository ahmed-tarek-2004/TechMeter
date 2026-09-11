import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowRight,
  Package,
  RotateCw,
  AlertCircle,
} from 'lucide-react';
import { OrderSummaryResponse } from '../../types';

interface ProfileOrdersTabProps {
  role: 'student' | 'provider' | 'admin';
  orders: OrderSummaryResponse[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

const ProfileOrdersTab: React.FC<ProfileOrdersTabProps> = ({
  role,
  orders,
  isLoading,
  isError,
  onRetry,
}) => {
  const isProvider = role === 'provider';

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null || isNaN(price)) return '$0.00';
    return `$${Number(price).toFixed(2)}`;
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (['completed', 'succeeded', 'paid', 'success'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
          {status || 'Completed'}
        </span>
      );
    }
    if (['pending', 'processing', 'incomplete'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
          <Clock className="w-3.5 h-3.5 mr-1" />
          {status || 'Pending'}
        </span>
      );
    }
    if (['cancelled', 'canceled', 'failed', 'refunded'].includes(s)) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40">
          <XCircle className="w-3.5 h-3.5 mr-1" />
          {status || 'Cancelled'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
        <Clock className="w-3.5 h-3.5 mr-1" />
        {status || 'Unknown'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-48 animate-pulse" />
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded-md w-36" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800/60 rounded-md w-24" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20" />
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-md w-16" />
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-100 dark:border-rose-900/30 p-10 text-center shadow-xs">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          Unable to Load Orders
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
          We encountered an issue fetching your orders from the server. Please try again.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <RotateCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {isProvider ? 'Sales Records' : 'Order History'}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
            {orders.length}
          </span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              title="Refresh Orders"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {isProvider ? (
          <Link
            to="/provider/orders"
            className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span>View Full Ledger</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        ) : role === 'admin' ? (
          <Link
            to="/admin/orders"
            className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span>Manage Orders</span>
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        ) : (
          <Link
            to="/orders"
            className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
          >
            <span>All Orders</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        )}
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            No orders found
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {isProvider
              ? 'No sales records recorded yet. Once students enroll in your courses, your sales will appear here.'
              : role === 'admin'
              ? 'No system orders to display in this overview. View the administrative order management dashboard.'
              : "You haven't placed any orders yet. Browse our catalog to discover courses and begin learning!"}
          </p>
          {isProvider ? (
            <Link
              to="/courses/create"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Package className="h-4 w-4" />
              <span>Create Course</span>
            </Link>
          ) : role === 'admin' ? (
            <Link
              to="/admin/orders"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Go to Admin Orders</span>
            </Link>
          ) : (
            <Link
              to="/courses"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Browse Courses</span>
            </Link>
          )}
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-4">
          {orders.map((order) => {
            const orderLink = isProvider
              ? '/provider/orders'
              : role === 'admin'
              ? '/admin/orders'
              : `/orders/${order.id}`;

            return (
              <div
                key={order.id || Math.random().toString()}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition-all duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Order ID & Date */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                        #{order.id ? (order.id.length > 8 ? order.id.slice(0, 8) : order.id) : '--------'}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      {order.itemCount !== undefined && order.itemCount !== null && (
                        <div className="flex items-center">
                          <Package className="h-3.5 w-3.5 mr-1 text-gray-400 dark:text-gray-500" />
                          <span>
                            {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Total Price & Action Button */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="text-left md:text-right">
                      <span className="block text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Total Amount
                      </span>
                      <div className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center md:justify-end">
                        <DollarSign className="h-4 w-4 -mr-0.5 text-gray-400 dark:text-gray-500" />
                        <span>{formatPrice(order.totalPrice).replace('$', '')}</span>
                      </div>
                    </div>

                    <Link
                      to={orderLink}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold transition duration-150 group"
                    >
                      <span>{isProvider ? 'View Record' : 'View Details'}</span>
                      {isProvider ? (
                        <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileOrdersTab;
