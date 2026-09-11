import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string; otp?: string }) => Promise<{ requiresOtp: boolean; userId?: string; user?: User }>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (fields: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthDataToUser(data: any): User {
  return {
    id: data.id,
    email: data.email ?? data.emailAddress ?? '',
    userName: data.userName,
    phoneNumber: data.phoneNumber,
    role: (data.role || '').toLowerCase() as 'student' | 'provider' | 'admin',
    profileUrl: data.photoUrl ?? data.profileUrl,
    isEmailConfirmed: data.isEmailConfirmed,
  };
}

function extractTokens(data: any): { accessToken?: string; refreshToken?: string } {
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUserState(JSON.parse(userData));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('user', JSON.stringify(u));
    } else {
      localStorage.removeItem('user');
    }
  };

  const updateUser = (fields: Partial<User>) => {
    setUserState((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...fields };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const login = async (data: { email: string; password: string; otp?: string }): Promise<{ requiresOtp: boolean; userId?: string; user?: User }> => {
    const response = await authService.login(data);

    // Check if backend response indicates success
    if (!response.succeeded) {
      // If not succeeded, throw error with the message
      throw new Error(response.message || response.errors?.join(', ') || 'Login failed');
    }

    // Success - extract auth data
    const authData = response.data;
    const { accessToken, refreshToken } = extractTokens(authData);

    // If no accessToken returned, backend sent OTP and requires verification
    if (!accessToken) {
      const extractedUserId = authData?.id || authData?.Id || authData?.userId || authData?.UserId || response?.data?.id || response?.data?.Id;
      return {
        requiresOtp: true,
        userId: extractedUserId,
      };
    }

    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    const userObj = mapAuthDataToUser(authData);
    setUser(userObj);
    return {
      requiresOtp: false,
      user: userObj,
    };
  };

  const register = async (data: any) => {
    const registerFn = data.role === 'provider'
      ? authService.registerProvider
      : authService.registerStudent;
    const authData = await registerFn(data);

    const { accessToken, refreshToken } = extractTokens(authData);
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    setUser(mapAuthDataToUser(authData));
    toast.success('Registration successful! Check your email for OTP.');
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // silently fail
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUserState(null);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      setUser,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
