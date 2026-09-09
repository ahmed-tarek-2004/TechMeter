import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { Loader2, ArrowLeft, Package, Calendar, CreditCard, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/common/ConfirmModal';
import { coursePlaceholder } from '../../utils/placeholders';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
    retry: false,
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Order cancelled successfully');
    },
    onError: () => toast.error('Failed to cancel order'),
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 transition-colors duration-200">
        <Package className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order not found</h2>
        <Link to="/orders" className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
          Back to orders
        </Link>
      </div>
    );
  }

  const canCancel = order.status === 'Pending';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/orders"
          className="inline-flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to orders
        </Link>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xs border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Order #{order.id.substring(0, 8)}
              </h1>
              <span
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold w-fit ${
                  order.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                    : order.status === 'Pending'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="flex items-start">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2.5 mt-0.5" />
                <div>
                  <p className="text-gray-400 dark:text-gray-500 font-medium">Order Date</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <CreditCard className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2.5 mt-0.5" />
                <div>
                  <p className="text-gray-400 dark:text-gray-500 font-medium">Total Amount</p>
                  <p className="font-bold text-gray-900 dark:text-white mt-0.5">${order.totalPrice.toFixed(2)}</p>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2.5 mt-0.5" />
                  <div>
                    <p className="text-gray-400 dark:text-gray-500 font-medium">Billing Address</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">{order.shippingAddress}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-5">Order Items</h2>
            <div className="space-y-3">
              {order.orderItems?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 rounded-2xl"
                >
                  <div className="flex items-center">
                    <img
                      src={item.courseImageUrl || coursePlaceholder}
                      alt={item.courseName}
                      className="w-16 h-12 object-cover rounded-xl border border-gray-100 dark:border-gray-800 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = coursePlaceholder;
                      }}
                    />
                    <div className="ml-3.5">
                      <h3 className="text-xs font-bold text-gray-900 dark:text-white">{item.courseName}</h3>
                      <Link
                        to={`/courses/${item.courseId}`}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 mt-0.5 inline-block"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {canCancel && (
            <div className="p-6 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={cancelOrderMutation.isPending}
                className="px-5 py-2.5 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-white dark:bg-gray-900 rounded-xl text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 disabled:opacity-50 transition"
              >
                Cancel Order
              </button>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={() => {
          cancelOrderMutation.mutate(order.id);
          setIsCancelModalOpen(false);
        }}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be reversed."
        confirmText="Yes, Cancel Order"
        variant="danger"
        isLoading={cancelOrderMutation.isPending}
      />
    </div>
  );
};

export default OrderDetail;
