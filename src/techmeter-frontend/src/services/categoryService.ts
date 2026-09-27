import api from './api';
import { ApiResponse, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types';

export const categoryService = {
  async getAllCategories(): Promise<ApiResponse<Category[]>> {
    const response = await api.get('/Category');
    return response.data;
  },

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    const response = await api.get(`/Category/detail/${id}`);
    return response.data;
  },

  async createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
    const response = await api.post('/Category/category', data);
    return response.data;
  },

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<ApiResponse<any>> {
    const response = await api.put(`/Category/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Category/${id}`);
    return response.data;
  },
};

