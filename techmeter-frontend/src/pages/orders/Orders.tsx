import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Package, Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.id, page],
    queryFn: () => orderService.getStudentOrders(user!.id, page, 10),
    enabled: !!user?.id,
    retry: false,
  });

  const orders = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">My Orders</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">View and manage your course purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No orders yet</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Start learning by purchasing a course from our catalog.</p>
            <Link
              to="/courses"
              className="inline-flex items-center px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/60 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <div className="mt-1 flex items-center text-xs text-gray-400 dark:text-gray-500">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center sm:text-right gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                        order.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                          : order.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                      }`}
                    >
                      {order.status}
                    </span>
                    <div className="text-lg font-extrabold text-gray-900 dark:text-white">
                      ${order.totalPrice.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Package className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                    {order.itemCount} {order.itemCount === 1 ? 'course' : 'courses'}
                  </div>
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  page === pageNum
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
