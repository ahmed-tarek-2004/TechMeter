import api from './api';
import { ApiResponse, Comment } from '../types';

export const commentService = {
  async getLessonComments(lessonId: string): Promise<ApiResponse<Comment[]>> {
    const response = await api.get(`/Comments/${lessonId}/all`);
    return response.data;
  },

  async addComment(lessonId: string, content: string, parentCommentId?: string): Promise<ApiResponse<Comment>> {
    const response = await api.post(`/Comments/${lessonId}`, { content, parentCommentId: parentCommentId || null });
    return response.data;
  },

  async editComment(commentId: string, content: string): Promise<ApiResponse<Comment>> {
    const response = await api.patch(`/Comments/${commentId}`, { content });
    return response.data;
  },

  async deleteComment(commentId: string, lessonId: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/Comments/${commentId}/lesson/${lessonId}`);
    return response.data;
  },

  async likeComment(commentId: string): Promise<ApiResponse<any>> {
    const response = await api.post(`/Comments/${commentId}/like`);
    return response.data;
  },

  async unlikeComment(commentId: string): Promise<ApiResponse<any>> {
    const response = await api.delete(`/Comments/${commentId}/like`);
    return response.data;
  },
};
