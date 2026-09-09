import api from './api';
import { ApiResponse, Contact, Message, PaginatedList } from '../types';

export const messageService = {
  async getContacts(pageNumber: number = 1, pageSize: number = 50): Promise<ApiResponse<PaginatedList<Contact>>> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = (user?.role || '').toLowerCase();

    // Student gets provider contacts, Provider gets student contacts
    const endpoint = role === 'provider'
      ? `/Contact/provider?pageNumber=${pageNumber}&pageSize=${pageSize}`
      : `/Contact/student?pageNumber=${pageNumber}&pageSize=${pageSize}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  async getMessages(_contactId?: string): Promise<Message[]> {
    // Messages are loaded through SignalR hub, but this can be used for initial load
    // Backend would need an endpoint for fetching message history
    // For now, return empty array as messages come through SignalR
    return [];
  },

  async sendMessage(_recipientId?: string, _message?: string): Promise<void> {
    // Messages are sent through SignalR hub connection
    // This is a placeholder for HTTP fallback if needed
    return Promise.resolve();
  },
};

