import api from './api';
import { ApiResponse, CartResponse, CartItemResponse } from '../types';

export const cartService = {
  async getCart(): Promise<ApiResponse<CartResponse>> {
    const response = await api.get('/Cart/student');
    const cart = response.data?.data;
    if (cart && Array.isArray(cart.items)) {
      cart.items = cart.items.map((item: any): CartItemResponse => {
        const imageUrl =
          item.courseImageUrl ||
          item.courseProfileImageUrl ||
          item.course?.courseProfileImageUrl ||
          item.course?.imageUrl ||
          item.imageUrl ||
          '';

        return {
          id: item.id || item.cartItemId || '',
          courseId: item.courseId || item.course?.id || '',
          unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice : (item.course?.price ?? 0),
          courseName: item.courseName || item.courseTitle || item.course?.title || 'Untitled Course',
          courseImageUrl: imageUrl,
          courseProfileImageUrl: imageUrl,
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });
    }
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
