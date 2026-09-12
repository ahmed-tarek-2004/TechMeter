import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Loader2, Bell, CheckCircle, CheckCheck, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Notifications: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadNotifications,
    unreadCount,
    totalCount,
    isLoading,
    isHubConnected,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const [markingId, setMarkingId] = useState<string | null>(null);

  const displayedNotifications = activeFilter === 'unread' ? unreadNotifications : notifications;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-16 transition-colors duration-200">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-3xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
            <Bell className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Please Sign In</h2>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Log in to view your real-time course updates, system notifications, and messages.
          </p>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              Sign in to TechMeter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center transition-colors duration-200">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Loading your notifications...</p>
      </div>
    );
  }

  const handleMarkSingle = async (id: string) => {
    try {
      setMarkingId(id);
      await markAsRead(id);
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10 transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Notifications
              </h1>
              {isHubConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Hub
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                  <Radio className="h-3 w-3" /> Syncing
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Real-time updates, course alerts, and platform announcements.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold border border-gray-200/80 dark:border-gray-800 shadow-xs transition"
              >
                <CheckCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 mb-6 border-b border-gray-200/80 dark:border-gray-800 pb-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-gray-800'
            }`}
          >
            <span>All</span>
            <span className="text-[10px] opacity-80">({totalCount || notifications.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeFilter === 'unread'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200/80 dark:border-gray-800'
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-extrabold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Notifications List */}
        {displayedNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800 p-8 shadow-xs">
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Bell className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              {activeFilter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {activeFilter === 'unread'
                ? 'All caught up! You have no pending unread notifications.'
                : 'When you enroll in courses, receive messages, or get updates, they will appear right here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div
                key={notification.id || `notif_${Math.random()}`}
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xs border p-4 sm:p-5 transition-all duration-200 ${
                  !notification.isRead
                    ? 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500/20'
                    : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                        !notification.isRead
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      <Bell className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate">
                          {notification.title || 'Notification'}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 animate-ping" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 leading-relaxed break-words">
                        {notification.message}
                      </p>
                      <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>

                  {!notification.isRead && notification.id && (
                    <button
                      onClick={() => handleMarkSingle(notification.id)}
                      disabled={markingId === notification.id}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition flex-shrink-0"
                      title="Mark as read"
                    >
                      {markingId === notification.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      ) : (
                        <CheckCircle className="h-4.5 w-4.5" />
                      )}
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
