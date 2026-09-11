import api from './api';
import { ApiResponse, OrderResponse, OrderSummaryResponse, PaginatedList } from '../types';

/**
 * Normalizes any order object into a consistent OrderSummaryResponse shape.
 * Accommodates camelCase, PascalCase, or custom backend DTO variants.
 */
function normalizeOrderSummary(item: any): OrderSummaryResponse {
  if (!item || typeof item !== 'object') {
    return {
      id: '',
      totalPrice: 0,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      itemCount: 0,
    };
  }

  const rawPrice =
    item.totalPrice ??
    item.TotalPrice ??
    item.totalAmount ??
    item.TotalAmount ??
    item.amount ??
    item.Amount ??
    item.price ??
    item.Price ??
    0;

  const totalPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice)) || 0;

  const rawCount =
    item.itemCount ??
    item.ItemCount ??
    item.itemsCount ??
    item.ItemsCount ??
    (Array.isArray(item.orderItems) ? item.orderItems.length : undefined) ??
    (Array.isArray(item.OrderItems) ? item.OrderItems.length : undefined) ??
    (Array.isArray(item.items) ? item.items.length : undefined) ??
    (Array.isArray(item.courses) ? item.courses.length : undefined) ??
    1;

  const itemCount = typeof rawCount === 'number' ? rawCount : parseInt(String(rawCount), 10) || 1;

  return {
    id: String(item.id || item.orderId || item.OrderId || item.Id || ''),
    totalPrice,
    status: String(item.status || item.Status || item.orderStatus || item.OrderStatus || 'Pending'),
    createdAt: item.createdAt || item.CreatedAt || item.orderDate || item.OrderDate || item.createdDate || new Date().toISOString(),
    itemCount,
  };
}

/**
 * Normalizes API response wrapping paginated, raw list, or envelope format.
 */
function normalizePaginatedOrders(
  raw: any,
  pageNumber = 1,
  pageSize = 10
): ApiResponse<PaginatedList<OrderSummaryResponse>> {
  // Extract data root if envelope exists
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
    } else if (Array.isArray(root.orders)) {
      rawItems = root.orders;
    } else if (Array.isArray(root.Orders)) {
      rawItems = root.Orders;
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
      Math.max(1, Math.ceil(totalCount / (pageSize || 10)));
  }

  const normalizedItems = rawItems.map(normalizeOrderSummary);

  return {
    statusCode: raw?.statusCode || 200,
    succeeded: raw?.succeeded !== undefined ? raw.succeeded : true,
    message: raw?.message || 'Orders fetched successfully',
    errors: raw?.errors,
    data: {
      items: normalizedItems,
      pageNumber: Number(root?.pageNumber || root?.PageNumber || pageNumber),
      pageSize: Number(root?.pageSize || root?.PageSize || pageSize),
      totalPages,
      totalCount,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
  };
}

/**
 * Tries fetching from a list of candidate API endpoints sequentially.
 * If 404/400 is returned, attempts the next candidate route.
 */
async function fetchWithFallback(candidateUrls: string[]): Promise<any> {
  let lastError: any = null;

  for (const url of candidateUrls) {
    try {
      const response = await api.get(url);
      if (response && response.data !== undefined) {
        return response.data;
      }
    } catch (err: any) {
      lastError = err;
      const status = err.response?.status;
      // If endpoint doesn't exist on backend (404) or route param mismatch (400), try fallback candidate
      if (status === 404 || status === 400 || status === 405) {
        continue;
      }
      // For auth errors (401, 403) or 500, throw immediately
      throw err;
    }
  }

  if (lastError) {
    throw lastError;
  }

  return { data: [] };
}

export const orderService = {
  /**
   * Get student orders with automatic fallback between token-based and ID-based endpoints.
   */
  async getStudentOrders(
    studentId?: string,
    pageNumber = 1,
    pageSize = 10
  ): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    const query = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const candidates: string[] = [];

    if (studentId && studentId.trim()) {
      const cleanId = encodeURIComponent(studentId.trim());
      candidates.push(`/Order/student/orders/${cleanId}?${query}`);
      candidates.push(`/Order/student/${cleanId}?${query}`);
      candidates.push(`/Order/student/${cleanId}/orders?${query}`);
    }

    // Token-based fallback routes
    candidates.push(`/Order/student/orders?${query}`);
    candidates.push(`/Order/student?${query}`);
    candidates.push(`/Order/my-orders?${query}`);
    candidates.push(`/Order/user/orders?${query}`);

    const rawData = await fetchWithFallback(candidates);
    return normalizePaginatedOrders(rawData, pageNumber, pageSize);
  },

  /**
   * Get provider orders with automatic fallback between token-based and ID-based endpoints.
   */
  async getProviderOrders(
    providerId?: string,
    pageNumber = 1,
    pageSize = 10
  ): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    const query = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const candidates: string[] = [];

    if (providerId && providerId.trim()) {
      const cleanId = encodeURIComponent(providerId.trim());
      candidates.push(`/Order/provider/orders/${cleanId}?${query}`);
      candidates.push(`/Order/provider/${cleanId}?${query}`);
      candidates.push(`/Order/provider/${cleanId}/orders?${query}`);
    }

    // Token-based fallback routes
    candidates.push(`/Order/provider/orders?${query}`);
    candidates.push(`/Order/provider?${query}`);
    candidates.push(`/Order/provider/my-orders?${query}`);

    const rawData = await fetchWithFallback(candidates);
    return normalizePaginatedOrders(rawData, pageNumber, pageSize);
  },

  /**
   * Get admin orders.
   */
  async getAdminOrders(
    pageNumber = 1,
    pageSize = 10,
    status?: string
  ): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    let query = `pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (status) {
      query += `&status=${encodeURIComponent(status)}`;
    }

    const candidates = [
      `/Order/admin?${query}`,
      `/Order/all?${query}`,
      `/Order/admin/orders?${query}`,
      `/Order?${query}`,
    ];

    const rawData = await fetchWithFallback(candidates);
    return normalizePaginatedOrders(rawData, pageNumber, pageSize);
  },

  /**
   * Get full order details by ID.
   */
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const cleanId = encodeURIComponent(orderId.trim());
    const candidates = [
      `/Order/${cleanId}`,
      `/Order/details/${cleanId}`,
      `/Order/student/order/${cleanId}`,
    ];

    let lastError: any = null;
    for (const url of candidates) {
      try {
        const response = await api.get<ApiResponse<OrderResponse>>(url);
        return response.data;
      } catch (err: any) {
        lastError = err;
        if (err.response?.status === 404 || err.response?.status === 400) continue;
        throw err;
      }
    }
    throw lastError;
  },

  /**
   * Cancel an order.
   */
  async cancelOrder(orderId: string): Promise<ApiResponse<void>> {
    const response = await api.put<ApiResponse<void>>(`/Order/cancel/${encodeURIComponent(orderId)}`);
    return response.data;
  },
};
