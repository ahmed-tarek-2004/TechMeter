import api from './api';
import { ApiResponse, WishlistItem } from '../types';

export const wishlistService = {
  async getWishlist(): Promise<ApiResponse<WishlistItem[]>> {
    const response = await api.get('/WishList');
    const rawData = response.data?.data;

    let items: any[] = [];
    if (Array.isArray(rawData)) {
      items = rawData;
    } else if (rawData && Array.isArray(rawData.items)) {
      items = rawData.items;
    } else if (rawData && Array.isArray(rawData.wishlistItems)) {
      items = rawData.wishlistItems;
    }

    const normalizedItems: WishlistItem[] = items.map((item: any) => ({
      id: item.id || item.wishlistItemId || String(item.courseId),
      courseId: item.courseId || item.course?.id || item.id,
      courseName: item.courseName || item.courseTitle || item.course?.title || item.title || 'Untitled Course',
      courseTitle: item.courseTitle || item.courseName || item.course?.title || item.title || 'Untitled Course',
      courseImageUrl: item.courseImageUrl || item.courseProfileImageUrl || item.course?.courseProfileImageUrl || item.imageUrl || '',
      courseProfileImageUrl: item.courseProfileImageUrl || item.courseImageUrl || item.course?.courseProfileImageUrl || '',
      price: typeof item.price === 'number' ? item.price : (item.course?.price ?? item.unitPrice ?? 0),
      currency: item.currency || item.course?.currency || 'USD',
      categoryId: item.categoryId || item.course?.categoryId,
      categoryName: item.categoryName || item.course?.category?.name,
      description: item.description || item.course?.description,
      addedAt: item.addedAt || item.createdAt || new Date().toISOString(),
      createdAt: item.createdAt || item.addedAt || new Date().toISOString(),
    }));

    return {
      ...response.data,
      data: normalizedItems,
    };
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
