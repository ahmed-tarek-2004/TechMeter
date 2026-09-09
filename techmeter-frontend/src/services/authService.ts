import api from './api';
import { AuthResponse, ApiResponse } from '../types';

export const authService = {
  async login(data: { email: string; password: string; otp?: string }): Promise<any> {
    const response = await api.post('/Account/login', {
      email: data.email,
      password: data.password,
      otp: data.otp || '',
    });

    // The response structure is: { succeeded, message, data: LoginResponseDto }
    return response.data;
  },

  async registerStudent(data: any): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('UserName', data.userName || '');
    formData.append('Email', data.email || '');
    formData.append('PhoneNumber', data.phoneNumber || '');
    formData.append('Password', data.password || '');
    formData.append('PassworfConfirmed', data.confirmPassword ?? data.password ?? '');
    formData.append('Country', data.country || '');
    formData.append('Gender', data.gender || 'Male');
    if (data.birthDate) formData.append('BirthDate', data.birthDate);
    if (data.educationLevel) formData.append('EducationLevel', data.educationLevel);
    if (data.profilePhoto) formData.append('ProfilePhoto', data.profilePhoto);
    const response = await api.post('/Account/student/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result = response.data;
    return result.data || result;
  },

  async registerProvider(data: any): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('UserName', data.userName || '');
    formData.append('Email', data.email || '');
    formData.append('PhoneNumber', data.phoneNumber || '');
    formData.append('Password', data.password || '');
    formData.append('PassworfConfirmed', data.confirmPassword ?? data.password ?? '');
    formData.append('Country', data.country || '');
    formData.append('Gender', data.gender || 'Male');
    if (data.bankAccount) formData.append('BankAccount', data.bankAccount);
    if (data.brief) formData.append('Brief', data.brief);
    if (data.experienceYears !== undefined) formData.append('ExperienceYears', String(data.experienceYears));
    if (data.profilePhoto) formData.append('ProfilePhoto', data.profilePhoto);
    const response = await api.post('/Account/provider/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const result = response.data;
    return result.data || result;
  },

  async forgotPassword(email: string): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/forget-password', { email });
    return response.data;
  },

  async resetPassword(data: { userId: string; token: string; password: string; confirmPassword: string }): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/reset-password', data);
    return response.data;
  },

  async confirmEmail(data: { userId: string; token: string }): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/confirm-email', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/change-password', data);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await api.post('/Account/refresh-token', JSON.stringify(refreshToken));
    return response.data;
  },

  async logout(): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/logout');
    return response.data;
  },

  async resendOtp(userId: string): Promise<ApiResponse<any>> {
    const response = await api.post('/Account/resend-otp', { Id: userId });
    return response.data;
  },
};
