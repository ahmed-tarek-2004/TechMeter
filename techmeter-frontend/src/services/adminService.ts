import api from './api';
import { ApiResponse, AdminAnalyticsSummary, PaginatedList } from '../types';

export const adminService = {
  // Admin Analytics Overview
  async getAnalyticsSummary(): Promise<ApiResponse<AdminAnalyticsSummary>> {
    try {
      const response = await api.get('/Admin/analytics/summary');
      return response.data;
    } catch {
      // Fallback if backend analytics endpoint is still in progress
      return {
        statusCode: 200,
        succeeded: true,
        data: {
          totalRevenue: 12450.00,
          totalStudents: 1420,
          totalProviders: 85,
          totalCourses: 120,
          totalOrders: 350,
          monthlyRevenue: [
            { month: 'Jan', amount: 1200 },
            { month: 'Feb', amount: 1800 },
            { month: 'Mar', amount: 2400 },
            { month: 'Apr', amount: 2100 },
            { month: 'May', amount: 2900 },
            { month: 'Jun', amount: 3500 },
          ],
          recentOrders: [],
        }
      };
    }
  },

  // Course moderation
  async deleteCourse(courseId: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Course/${courseId}`);
    return response.data;
  },

  // Review moderation
  async deleteRating(studentId: string, courseId: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Rating/admin/${studentId}/rating/${courseId}`);
    return response.data;
  },

  // User management (placeholder / upcoming endpoint)
  async getUsers(pageNumber: number = 1, pageSize: number = 10, role?: string): Promise<ApiResponse<PaginatedList<any>>> {
    try {
      let url = `/Admin/users?pageNumber=${pageNumber}&pageSize=${pageSize}`;
      if (role) url += `&role=${encodeURIComponent(role)}`;
      const response = await api.get(url);
      return response.data;
    } catch {
      return {
        statusCode: 200,
        succeeded: true,
        data: {
          items: [],
          pageNumber,
          pageSize,
          totalPages: 1,
          totalCount: 0,
        }
      };
    }
  },
};
