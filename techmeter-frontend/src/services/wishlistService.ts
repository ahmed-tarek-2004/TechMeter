import api from './api';
import { ApiResponse, WishlistItem } from '../types';

export const wishlistService = {
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    const response = await api.get('/WishList');
    return response.data;
  },

  async addToWishlist(courseId: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/WishList/${courseId}`);
    return response.data;
  },

  async removeFromWishlist(wishlistItemId: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/WishList/${wishlistItemId}`);
    return response.data;
  },

  async clearWishlist(): Promise<ApiResponse<any>> {
    const response = await api.delete('/WishList/clear');
    return response.data;
  },
};
