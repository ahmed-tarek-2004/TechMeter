import api from './api';
import { ApiResponse, OrderResponse, OrderSummaryResponse, PaginatedList } from '../types';

export const orderService = {
  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.get(`/Order/${orderId}`);
    return response.data;
  },

  async getStudentOrders(studentId: string, pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    const response = await api.get(`/Order/student/orders/${studentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  async getProviderOrders(providerId: string, pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    const response = await api.get(`/Order/provider/orders/${providerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  async getAdminOrders(pageNumber: number = 1, pageSize: number = 10, status?: string): Promise<ApiResponse<PaginatedList<OrderSummaryResponse>>> {
    let url = `/Order/admin?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const response = await api.get(url);
    return response.data;
  },

  async cancelOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.put(`/Order/cancel/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.put(`/Order/status/${orderId}`, { status });
    return response.data;
  },

  async deleteOrder(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.delete(`/Order/${orderId}`);
    return response.data;
  },
};

