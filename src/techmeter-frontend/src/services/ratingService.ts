import api from './api';
import { ApiResponse, Rating } from '../types';

export const ratingService = {
  async addRating(data: { courseId: string; rating: number; comment?: string }): Promise<ApiResponse<string>> {
    const response = await api.post('/Rating/student', data);
    return response.data;
  },

  async updateRating(data: { courseId: string; rating: number; comment?: string }): Promise<ApiResponse<string>> {
    const response = await api.put('/Rating/student', data);
    return response.data;
  },

  async getStudentCourseRating(courseId: string): Promise<ApiResponse<Rating>> {
    const response = await api.get(`/Rating/student/${courseId}`);
    return response.data;
  },

  async getAllCourseRatings(courseId: string): Promise<ApiResponse<Rating[]>> {
    const response = await api.get(`/Rating/all/${courseId}`);
    return response.data;
  },

  async deleteRating(courseId: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Rating/student/${courseId}`);
    return response.data;
  },
};
