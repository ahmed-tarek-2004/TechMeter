import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { notificationHubService } from '../services/notificationHubService';
import { messageHubService } from '../services/messageHubService';
import { activeChatTracker } from '../services/activeChatTracker';
import { useAuth } from './AuthContext';
import { Notification, ApiResponse, PaginatedList } from '../types';
import toast from 'react-hot-toast';
import { Bell, ArrowRight, MessageSquare } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadNotifications: Notification[];
  unreadCount: number;
  totalCount: number;
  isLoading: boolean;
  isHubConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [isHubConnected, setIsHubConnected] = useState(false);

  // Fetch all notifications (with pagination support)
  const {
    data: notificationsData,
    isLoading: isLoadingAll,
    refetch: refetchAll,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });

  // Fetch unread notifications
  const {
    data: unreadData,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useQuery({
    queryKey: ['unread-notifications'],
    queryFn: () => notificationService.getUnreadNotifications(1, 50),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 1,
  });

  // Safely extract notifications array from paginated or raw data
  const notifications: Notification[] = useMemo(() => {
    const raw = notificationsData?.data;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'object') {
      if (Array.isArray(raw.items)) return raw.items;
      if (Array.isArray((raw as any).Items)) return (raw as any).Items;
    }
    return [];
  }, [notificationsData]);

  // Safely extract unread notifications
  const unreadNotifications: Notification[] = useMemo(() => {
    const raw = unreadData?.data;
    let list: Notification[] = [];
    if (raw) {
      if (Array.isArray(raw)) {
        list = raw;
      } else if (typeof raw === 'object') {
        if (Array.isArray(raw.items)) list = raw.items;
        else if (Array.isArray((raw as any).Items)) list = (raw as any).Items;
      }
    }

    if (list.length > 0) {
      return list;
    }

    // Fallback: derive unread from all notifications based on isRead attribute
    return notifications.filter((n) => !n.isRead);
  }, [unreadData, notifications]);

  // Total count of all notifications
  const totalCount = useMemo(() => {
    const raw = notificationsData?.data;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (typeof raw.totalCount === 'number') return raw.totalCount;
      if (typeof raw.count === 'number') return raw.count;
    }
    return notifications.length;
  }, [notificationsData, notifications]);

  // Accurate unread count
  const unreadCount = useMemo(() => {
    const raw = unreadData?.data;
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (typeof raw.totalCount === 'number') return raw.totalCount;
      if (typeof raw.count === 'number') return raw.count;
    }
    return unreadNotifications.length;
  }, [unreadData, unreadNotifications]);

  // Mark single notification as read mutation with optimistic update on isRead
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onMutate: async (notificationId: string) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      await queryClient.cancelQueries({ queryKey: ['unread-notifications'] });

      const prevNotifications = queryClient.getQueryData<ApiResponse<PaginatedList<Notification>>>(['notifications']);
      const prevUnread = queryClient.getQueryData<ApiResponse<PaginatedList<Notification>>>(['unread-notifications']);

      // Optimistically update all notifications list
      if (prevNotifications?.data?.items) {
        queryClient.setQueryData(['notifications'], {
          ...prevNotifications,
          data: {
            ...prevNotifications.data,
            items: prevNotifications.data.items.map((item) =>
              item.id === notificationId ? { ...item, isRead: true } : item
            ),
          },
        });
      }

      // Optimistically update unread notifications list
      if (prevUnread?.data?.items) {
        const updatedUnreadItems = prevUnread.data.items.filter((item) => item.id !== notificationId);
        queryClient.setQueryData(['unread-notifications'], {
          ...prevUnread,
          data: {
            ...prevUnread.data,
            items: updatedUnreadItems,
            totalCount: Math.max(0, (prevUnread.data.totalCount || updatedUnreadItems.length + 1) - 1),
            count: Math.max(0, (prevUnread.data.count || updatedUnreadItems.length + 1) - 1),
          },
        });
      }

      return { prevNotifications, prevUnread };
    },
    onError: (error: any, _variables, context) => {
      if (context?.prevNotifications) {
        queryClient.setQueryData(['notifications'], context.prevNotifications);
      }
      if (context?.prevUnread) {
        queryClient.setQueryData(['unread-notifications'], context.prevUnread);
      }
      const msg = error?.response?.data?.message || 'Failed to mark notification as read';
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    },
  });

  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated || !notificationId) return;
    await markAsReadMutation.mutateAsync(notificationId);
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;
    try {
      await notificationService.markAllAsRead();
    } catch {
      // Fallback to individual items if needed
      const unreadIds = unreadNotifications.map((n) => n.id).filter(Boolean);
      if (unreadIds.length > 0) {
        const promises = unreadIds.map((id) => notificationService.markAsRead(id));
        await Promise.allSettled(promises);
      }
    }
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
    toast.success('All notifications marked as read');
  };

  const refetch = useCallback(() => {
    refetchAll();
    refetchUnread();
  }, [refetchAll, refetchUnread]);

  // SignalR Notification Hub & Message Hub Connection Lifecycle
  useEffect(() => {
    if (!isAuthenticated || !user) {
      notificationHubService.disconnect();
      messageHubService.disconnect();
      setIsHubConnected(false);
      return;
    }

    // Connect to notification hub
    notificationHubService.connect().then(() => {
      setIsHubConnected(notificationHubService.isConnected());
    });

    // Connect to message hub for real-time global messages
    messageHubService.connect();

    const unsubscribeState = notificationHubService.onConnectionStateChanged((connected) => {
      setIsHubConnected(connected);
    });

    // Listen for incoming general notifications from notificationHub
    const unsubscribeNotifications = notificationHubService.onNotificationReceived((newNotification) => {
      const isMessageNotification =
        (newNotification.title || '').toLowerCase().includes('message') ||
        (newNotification.message || '').toLowerCase().includes('message');

      // If user is currently on the chat page (/messages), suppress all message notification toasts
      if (isMessageNotification && activeChatTracker.getIsChatPageOpen()) {
        if (newNotification.id) {
          notificationService.markAsRead(newNotification.id).catch(() => {});
        }
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
        return;
      }

      // Invalidate queries to refresh notification counters
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });

      // Display rich animated Toast Notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'
            } max-w-sm w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-3.5 border border-indigo-100 dark:border-indigo-900/50 transition duration-200`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs">
                    {isMessageNotification ? (
                      <MessageSquare className="h-4.5 w-4.5 animate-bounce" />
                    ) : (
                      <Bell className="h-4.5 w-4.5 animate-bounce" />
                    )}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                    {newNotification.title || 'New Notification'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {newNotification.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={isMessageNotification ? '/messages' : '/notifications'}
                      onClick={() => toast.dismiss(t.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <span>{isMessageNotification ? 'Open Chat' : 'View alerts'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-2 flex flex-shrink-0 self-start">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <span className="text-xs font-bold">✕</span>
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    // Listen for incoming direct messages via messageHub
    const unsubscribeMessages = messageHubService.onMessageReceived((incomingMsg) => {
      const senderId = incomingMsg.sender?.senderId;

      // Ignore our own sent messages
      if (senderId === user?.id) {
        return;
      }

      // If user is currently on the chat page (/messages), do not show global toast
      if (activeChatTracker.getIsChatPageOpen()) {
        return;
      }

      // If user is on another page or chatting with someone else, show real-time message notification
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-in fade-in slide-in-from-top-4' : 'animate-out fade-out slide-out-to-top-2'
            } max-w-sm w-full bg-white dark:bg-gray-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-3.5 border border-indigo-200/80 dark:border-indigo-800/60 transition duration-200`}
          >
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
                      {incomingMsg.sender?.senderName || 'New Message'}
                    </p>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500">Just now</span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {incomingMsg.content}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href="/messages"
                      onClick={() => toast.dismiss(t.id)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      <span>Open chat to reply</span>
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-2 flex flex-shrink-0 self-start">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
              >
                <span className="sr-only">Close</span>
                <span className="text-xs font-bold">✕</span>
              </button>
            </div>
          </div>
        ),
        { duration: 5000 }
      );
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeMessages();
      unsubscribeState();
    };
  }, [isAuthenticated, user, queryClient]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadNotifications,
        unreadCount: isAuthenticated ? unreadCount : 0,
        totalCount: isAuthenticated ? totalCount : 0,
        isLoading: isAuthenticated ? isLoadingAll || isLoadingUnread : false,
        isHubConnected,
        markAsRead,
        markAllAsRead,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
