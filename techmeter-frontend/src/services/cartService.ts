import api from './api';
import { ApiResponse, CartResponse } from '../types';

export const cartService = {
  async getCart(): Promise<ApiResponse<CartResponse>> {
    const response = await api.get('/Cart/student');
    return response.data;
  },

  async addToCart(courseId: string): Promise<ApiResponse<CartResponse>> {
    const response = await api.post('/Cart/student', { courseId });
    return response.data;
  },

  async removeFromCart(cartItemId: string): Promise<ApiResponse<CartResponse>> {
    const response = await api.delete(`/Cart/student/${cartItemId}`);
    return response.data;
  },

  async clearCart(): Promise<ApiResponse<CartResponse>> {
    const response = await api.delete('/Cart/clear');
    return response.data;
  },
};
