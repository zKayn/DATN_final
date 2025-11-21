// SportShopApp/src/store/authStore.ts

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    console.log('=== AUTH STORE LOGIN ===');
    console.log('📧 Email:', email);
    
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.login(email, password);
      
      console.log('📦 Full Response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      // 🔥 FIX: Get tokens from nested structure
      const { user, tokens } = response.data;
      const { accessToken, refreshToken } = tokens;

      console.log('👤 User:', user);
      console.log('🔑 Access Token:', accessToken?.substring(0, 20) + '...');
      console.log('🔑 Refresh Token:', refreshToken?.substring(0, 20) + '...');

      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not received from server');
      }

      // Save to AsyncStorage
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      console.log('💾 Saved to storage');

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ Login successful!');
    } catch (error: any) {
      console.error('❌ LOGIN ERROR:');
      console.error('   Message:', error.message);
      console.error('   Response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Login failed';

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data: any) => {
    console.log('=== AUTH STORE REGISTER ===');
    console.log('📧 Email:', data.email);
    
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.register(data);
      
      console.log('📦 Full Response:', JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }

      // 🔥 FIX: Get tokens from nested structure
      const { user, tokens } = response.data;
      const { accessToken, refreshToken } = tokens;

      console.log('👤 User:', user);
      console.log('🔑 Tokens received');

      if (!accessToken || !refreshToken) {
        throw new Error('Tokens not received from server');
      }

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('✅ Register successful!');
    } catch (error: any) {
      console.error('❌ REGISTER ERROR:');
      console.error('   Message:', error.message);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Registration failed';

      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    }
  },

  loadUser: async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userStr = await AsyncStorage.getItem('user');

      if (accessToken && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          accessToken,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Load user error:', error);
    }
  },

  updateProfile: async (data: any) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiService.updateProfile(data);
      const updatedUser = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

      set({
        user: updatedUser,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Update failed',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));