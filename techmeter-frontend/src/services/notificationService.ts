import api from './api';
import { ApiResponse, Notification, PaginatedList } from '../types';

/**
 * Normalizes any notification payload (handling PascalCase, camelCase, or mismatched fields).
 */
export function normalizeNotification(item: any): Notification {
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      title: '',
      message: '',
      createdAt: new Date().toISOString(),
      isRead: false,
      receiptId: '',
    };
  }

  return {
    id: String(item.id ?? item.Id ?? item.notificationId ?? item.NotificationId ?? ''),
    title: String(item.title ?? item.Title ?? item.titile ?? item.Titile ?? 'Notification'),
    message: String(
      item.message ?? item.Message ?? item.body ?? item.Body ?? item.content ?? item.Content ?? ''
    ),
    createdAt: String(
      item.createdAt ??
        item.CreatedAt ??
        item.createdDate ??
        item.CreatedDate ??
        item.sentAt ??
        item.SentAt ??
        new Date().toISOString()
    ),
    isRead: Boolean(item.isRead ?? item.IsRead ?? false),
    receiptId: String(item.receiptId ?? item.ReceiptId ?? item.userId ?? item.UserId ?? ''),
  };
}

/**
 * Normalizes paginated or raw notification responses into a standard ApiResponse<PaginatedList<Notification>> shape.
 */
export function normalizePaginatedNotifications(
  raw: any,
  pageNumber = 1,
  pageSize = 50
): ApiResponse<PaginatedList<Notification>> {
  const root = raw?.data !== undefined ? raw.data : raw;

  let rawItems: any[] = [];
  let totalCount = 0;
  let totalPages = 1;

  if (Array.isArray(root)) {
    rawItems = root;
    totalCount = root.length;
    totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  } else if (root && typeof root === 'object') {
    if (Array.isArray(root.items)) {
      rawItems = root.items;
    } else if (Array.isArray(root.Items)) {
      rawItems = root.Items;
    } else if (Array.isArray(root.notifications)) {
      rawItems = root.notifications;
    } else if (Array.isArray(root.Notifications)) {
      rawItems = root.Notifications;
    } else if (Array.isArray(root.data)) {
      rawItems = root.data;
    } else if (Array.isArray(root.list)) {
      rawItems = root.list;
    }

    totalCount =
      Number(root.totalCount ?? root.TotalCount ?? root.count ?? root.Count ?? root.total) ||
      rawItems.length;

    totalPages =
      Number(root.totalPages ?? root.TotalPages) ||
      Math.max(1, Math.ceil(totalCount / (pageSize || 50)));
  }

  const normalizedItems = rawItems.map(normalizeNotification);

  return {
    statusCode: raw?.statusCode || 200,
    succeeded: raw?.succeeded !== undefined ? raw.succeeded : true,
    message: raw?.message || 'Notifications fetched successfully',
    errors: raw?.errors,
    data: {
      items: normalizedItems,
      pageNumber: Number(root?.pageNumber || root?.PageNumber || pageNumber),
      pageSize: Number(root?.pageSize || root?.PageSize || pageSize),
      totalPages,
      totalCount,
      count: totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
  };
}

export const notificationService = {
  /**
   * Fetch all notifications with pagination and graceful fallback.
   */
  async getNotifications(
    pageNumber = 1,
    pageSize = 50
  ): Promise<ApiResponse<PaginatedList<Notification>>> {
    try {
      const response = await api.get('/Notification/all', {
        params: {
          pageNumber,
          pageSize,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });
      return normalizePaginatedNotifications(response.data, pageNumber, pageSize);
    } catch (err: any) {
      // Gracefully handle 403/404 without breaking context
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        return normalizePaginatedNotifications({ data: [] }, pageNumber, pageSize);
      }
      throw err;
    }
  },

  /**
   * Fetch unread notifications with pagination and graceful fallback.
   */
  async getUnreadNotifications(
    pageNumber = 1,
    pageSize = 50
  ): Promise<ApiResponse<PaginatedList<Notification>>> {
    try {
      const response = await api.get('/Notification/unread', {
        params: {
          pageNumber,
          pageSize,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      });
      return normalizePaginatedNotifications(response.data, pageNumber, pageSize);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        return normalizePaginatedNotifications({ data: [] }, pageNumber, pageSize);
      }
      throw err;
    }
  },

  /**
   * Mark a notification as read.
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    const cleanId = encodeURIComponent(notificationId.trim());
    const response = await api.post(`/Notification/${cleanId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read.
   */
  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    const response = await api.post('/Notification/read/all');
    return response.data;
  },

  /**
   * Store FCM device token.
   */
  async storeFcmToken(token: string): Promise<any> {
    const response = await api.post('/Notification/store/token', { token });
    return response.data;
  },
};
