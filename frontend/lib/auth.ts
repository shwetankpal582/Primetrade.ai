import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  avatar?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileData): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },
};

// Token management
export const tokenManager = {
  setToken: (token: string) => {
    Cookies.set('token', token, { 
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  getToken: () => {
    return Cookies.get('token');
  },

  removeToken: () => {
    Cookies.remove('token');
  },
};

// User management
export const userManager = {
  setUser: (user: User) => {
    Cookies.set('user', JSON.stringify(user), { 
      expires: 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
  },

  getUser: (): User | null => {
    const userStr = Cookies.get('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  removeUser: () => {
    Cookies.remove('user');
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = userManager.getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      userManager.setUser(updatedUser);
      return updatedUser;
    }
    return null;
  },
};

// Auth helpers
export const authHelpers = {
  isAuthenticated: () => {
    return !!tokenManager.getToken() && !!userManager.getUser();
  },

  logout: () => {
    tokenManager.removeToken();
    userManager.removeUser();
  },

  loginUser: (token: string, user: User) => {
    tokenManager.setToken(token);
    userManager.setUser(user);
  },
};

