import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { Loader2, Bell, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
    enabled: isAuthenticated,
    retry: false,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Marked as read');
    },
  });

  const notifications = notificationsData?.data || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Please login to view notifications</h2>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Notifications</h1>
        {notifications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No notifications</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">You're all caught up with your latest alerts!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xs border p-5 transition ${
                  !notification.isRead
                    ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{notification.message}</p>
                    <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
