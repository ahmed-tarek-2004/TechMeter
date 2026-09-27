import api from './api';
import { ApiResponse } from '../types';

export const contactService = {
  async getStudentContacts(pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<any>> {
    const response = await api.get(`/Contact/student?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },

  async getProviderContacts(pageNumber: number = 1, pageSize: number = 10): Promise<ApiResponse<any>> {
    const response = await api.get(`/Contact/provider?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return response.data;
  },
};