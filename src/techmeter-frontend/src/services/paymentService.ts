import api from './api';
import { ApiResponse, PaymentIntentResponse, Transaction, PaginatedList } from '../types';

export const paymentService = {
  async createPaymentIntent(currency: string = 'usd'): Promise<ApiResponse<PaymentIntentResponse>> {
    const response = await api.post('/Payment/create-payment-intent', { currency });
    return response.data;
  },

  async checkout(currency: string = 'usd'): Promise<ApiResponse<any>> {
    const response = await api.post('/Payment/check-out', { currency });
    return response.data;
  },

  async getProviderTransactions(params?: { from?: string; to?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<PaginatedList<Transaction> | any>> {
    const query = new URLSearchParams();
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    const response = await api.get(`/Payment/provider/all/transaction?${query.toString()}`);
    return response.data;
  },

  async getAdminTransactions(params?: { providerId?: string; from?: string; to?: string; pageNumber?: number; pageSize?: number }): Promise<ApiResponse<PaginatedList<Transaction> | any>> {
    const query = new URLSearchParams();
    if (params?.providerId) query.append('providerId', params.providerId);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.pageNumber) query.append('pageNumber', params.pageNumber.toString());
    if (params?.pageSize) query.append('pageSize', params.pageSize.toString());
    const response = await api.get(`/Payment/admin/all/transaction?${query.toString()}`);
    return response.data;
  },
};

