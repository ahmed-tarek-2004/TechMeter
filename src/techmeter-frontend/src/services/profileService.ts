import api from './api';
import { ApiResponse, StudentProfile, ProviderProfile } from '../types';

export const profileService = {
  async getStudentProfile(): Promise<ApiResponse<StudentProfile>> {
    const response = await api.get('/Profile/student');
    return response.data;
  },

  async getProviderProfile(): Promise<ApiResponse<ProviderProfile>> {
    const response = await api.get('/Profile/provider');
    return response.data;
  },

  async updateStudentProfile(data: FormData): Promise<ApiResponse<string>> {
    const response = await api.put('/Profile/student', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateProviderProfile(data: FormData): Promise<ApiResponse<string>> {
    const response = await api.put('/Profile/provider', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
