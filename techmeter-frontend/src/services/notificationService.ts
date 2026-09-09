import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await api.get('/Notification/all');
    return response.data;
  },

  async getUnreadNotifications(): Promise<ApiResponse<Notification[]>> {
    const response = await api.get('/Notification/unread');
    return response.data;
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
    const response = await api.post(`/Notification/${notificationId}/read`);
    return response.data;
  },
};
