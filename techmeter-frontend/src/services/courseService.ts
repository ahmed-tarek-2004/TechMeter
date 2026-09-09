import api from './api';
import { Course, ApiResponse } from '../types';

export const courseService = {
  async getAllCourses(): Promise<ApiResponse<Course[]>> {
    const response = await api.get('/Course/all');
    return response.data;
  },

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await api.get(`/Course/${id}`);
    return response.data;
  },

  async getProviderCourses(): Promise<ApiResponse<Course[]>> {
    const response = await api.get('/Course/provider');
    return response.data;
  },

  async getStudentCourses(): Promise<ApiResponse<Course[]>> {
    const response = await api.get('/Course/student');
    return response.data;
  },

  async createCourse(data: FormData): Promise<ApiResponse<Course>> {
    const response = await api.post('/Course', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateCourse(courseId: string, data: FormData): Promise<ApiResponse<string>> {
    const response = await api.put(`/Course/${courseId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteCourse(courseId: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Course/${courseId}`);
    return response.data;
  },
};