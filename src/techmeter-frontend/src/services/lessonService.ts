import api from './api';
import { ApiResponse, Lesson } from '../types';

export const lessonService = {
  async addLesson(
    sectionId: string,
    data: FormData,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<Lesson>> {
    const response = await api.post(`/Lesson/${sectionId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    });
    return response.data;
  },

  async getLessonById(id: string): Promise<ApiResponse<Lesson>> {
    const response = await api.get(`/Lesson/${id}`);
    return response.data;
  },

  async getCourseLessons(courseId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get(`/Lesson/course/${courseId}/all`);
    return response.data;
  },

  async getSectionLessons(sectionId: string): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get(`/Lesson/${sectionId}/lessons`);
    return response.data;
  },

  async getWatchedLessons(): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get('/Lesson/student/watched');
    return response.data;
  },

  async markLessonAsWatched(id: string): Promise<ApiResponse<string>> {
    const response = await api.post(`/Lesson/${id}/finish`);
    return response.data;
  },

  async markLessonAsUnwatched(id: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Lesson/${id}/unfinish`);
    return response.data;
  },

  async updateLesson(id: string, data: FormData): Promise<ApiResponse<Lesson>> {
    const response = await api.put(`/Lesson/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Alias for updateLesson
  async editLesson(id: string, data: FormData): Promise<ApiResponse<Lesson>> {
    return this.updateLesson(id, data);
  },

  async deleteLesson(id: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Lesson/${id}`);
    return response.data;
  },
};

