import api from './api';
import { ApiResponse, Section, AddSectionRequest, EditSectionRequest } from '../types';

export const sectionService = {
  async getSectionsByCourse(courseId: string): Promise<ApiResponse<Section[]>> {
    const response = await api.get(`/Section/${courseId}/all`);
    return response.data;
  },

  async getSectionDetail(courseId: string, sectionId: string): Promise<ApiResponse<Section>> {
    const response = await api.get(`/Section/course/${courseId}/detail/${sectionId}`);
    return response.data;
  },

  async createSection(
    courseId: string,
    data: { name?: string; sectionName?: string } | AddSectionRequest
  ): Promise<ApiResponse<string>> {
    const sectionName = ('sectionName' in data ? data.sectionName : (data as any).name) || '';
    const response = await api.post(`/Section/course/${courseId}`, {
      sectionName,
      SectionName: sectionName,
    });
    return response.data;
  },

  async updateSection(
    sectionId: string,
    data: { name: string; courseId: string } | EditSectionRequest
  ): Promise<ApiResponse<string>> {
    const response = await api.put(`/Section/${sectionId}`, {
      name: data.name,
      courseId: data.courseId,
    });
    return response.data;
  },

  async deleteSection(courseId: string, sectionId: string): Promise<ApiResponse<string>> {
    const response = await api.delete(`/Section/${courseId}/section/${sectionId}`);
    return response.data;
  },
};

