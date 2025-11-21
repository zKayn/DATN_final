// admin-web/src/store/authStore.ts
// Version 2.1 - With Admin Support for Dashboard Analytics

import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string; // ✅ ADD: For admin display name
  role: string;
}

interface AuthState {
  user: User | null;
  admin: User | null; // ✅ ADD: Alias for admin context
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Storage utility with fallback
class StorageManager {
  private static inMemoryStorage: { [key: string]: string } = {};
  private static storageType: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage';

  static setItem(key: string, value: string): boolean {
    try {
      // Try localStorage first
      localStorage.setItem(key, value);
      const verify = localStorage.getItem(key);
      if (verify === value) {
        console.log(`✅ Saved to localStorage: ${key}`);
        this.storageType = 'localStorage';
        return true;
      }
    } catch (e) {
      console.warn('⚠️ localStorage failed:', e);
    }

    try {
      // Fallback to sessionStorage
      sessionStorage.setItem(key, value);
      const verify = sessionStorage.getItem(key);
      if (verify === value) {
        console.log(`✅ Saved to sessionStorage: ${key}`);
        this.storageType = 'sessionStorage';
        return true;
      }
    } catch (e) {
      console.warn('⚠️ sessionStorage failed:', e);
    }

    // Last resort: in-memory storage
    console.warn('⚠️ Using in-memory storage (will be lost on refresh)');
    this.inMemoryStorage[key] = value;
    this.storageType = 'memory';
    return true;
  }

  static getItem(key: string): string | null {
    // Try localStorage first
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch (e) {
      console.warn('⚠️ localStorage read failed:', e);
    }

    // Try sessionStorage
    try {
      const value = sessionStorage.getItem(key);
      if (value) return value;
    } catch (e) {
      console.warn('⚠️ sessionStorage read failed:', e);
    }

    // Try in-memory storage
    return this.inMemoryStorage[key] || null;
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
    
    try {
      sessionStorage.removeItem(key);
    } catch (e) {}
    
    delete this.inMemoryStorage[key];
  }

  static clear(): void {
    try {
      localStorage.clear();
    } catch (e) {}
    
    try {
      sessionStorage.clear();
    } catch (e) {}
    
    this.inMemoryStorage = {};
  }

  static getStorageType(): string {
    return this.storageType;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  admin: null, // ✅ ADD: Initialize admin
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      console.log('🔵 AuthStore: Starting login...');
      set({ isLoading: true });

      const response = await api.post('/admin/auth/login', { email, password });
      console.log('📦 AuthStore: Full API Response:', response);
      console.log('📦 AuthStore: Response data:', response.data);

      if (response.data?.success && response.data?.data) {
        // ✅ FIX: Backend returns { success, data: { token, user } }
        const { token, user } = response.data.data;

        console.log('✅ AuthStore: Received data');
        console.log('  - Token:', token ? token.substring(0, 20) + '...' : 'MISSING');
        console.log('  - User:', user);

        // Validate user data
        if (!user || !user.id || !user.email) {
          console.error('❌ Invalid user structure:', user);
          throw new Error('Invalid user data from server');
        }

        if (!token) {
          console.error('❌ No token received');
          throw new Error('No token received from server');
        }

        // ✅ ADD: Create display name for admin
        const adminUser = {
          ...user,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        };

        console.log('💾 AuthStore: Attempting to save...');

        // Save token
        const tokenSaved = StorageManager.setItem('adminToken', token);
        console.log('  - Token saved:', tokenSaved);

        // Save user
        const userStr = JSON.stringify(adminUser); // ✅ Save with name
        const userSaved = StorageManager.setItem('adminUser', userStr);
        console.log('  - User saved:', userSaved);

        if (!tokenSaved || !userSaved) {
          throw new Error('Failed to save to storage');
        }

        // Verify immediately
        console.log('🔍 Verifying save...');
        const savedToken = StorageManager.getItem('adminToken');
        const savedUserStr = StorageManager.getItem('adminUser');
        
        console.log('  - Token retrieved:', !!savedToken);
        console.log('  - User retrieved:', !!savedUserStr);

        if (!savedToken || !savedUserStr) {
          console.error('❌ Verification failed!');
          console.error('  - Token in storage:', savedToken ? 'YES' : 'NO');
          console.error('  - User in storage:', savedUserStr ? 'YES' : 'NO');
          throw new Error('Storage verification failed');
        }

        // Parse and validate retrieved user
        const retrievedUser = JSON.parse(savedUserStr);
        if (!retrievedUser.id || !retrievedUser.email) {
          console.error('❌ Retrieved user invalid:', retrievedUser);
          throw new Error('Retrieved user data is invalid');
        }

        console.log('✅ Verification successful!');
        console.log('  - Storage type:', StorageManager.getStorageType());

        // ✅ UPDATE: Set both user and admin
        set({
          user: adminUser,
          admin: adminUser, // ✅ Set admin as alias
          isAuthenticated: true,
          isLoading: false,
        });

        console.log('✅ AuthStore: Login complete');
      } else {
        console.error('❌ Invalid server response structure');
        console.error('  - response.data:', response.data);
        throw new Error('Invalid server response');
      }
    } catch (error: any) {
      console.error('❌ AuthStore: Login error:', error);
      console.error('  - Error message:', error.message);
      console.error('  - Error response:', error.response?.data);
      set({ 
        isLoading: false, 
        isAuthenticated: false, 
        user: null,
        admin: null // ✅ Clear admin
      });
      throw error;
    }
  },

  logout: () => {
    console.log('🔵 AuthStore: Logging out...');
    StorageManager.removeItem('adminToken');
    StorageManager.removeItem('adminUser');
    set({ 
      user: null, 
      admin: null, // ✅ Clear admin
      isAuthenticated: false 
    });
  },

  checkAuth: () => {
    console.log('🔍 AuthStore: Checking auth...');
    
    const token = StorageManager.getItem('adminToken');
    const userStr = StorageManager.getItem('adminUser');

    console.log('📦 Retrieved from storage:');
    console.log('  - Token exists:', !!token);
    console.log('  - User exists:', !!userStr);
    console.log('  - Storage type:', StorageManager.getStorageType());

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        console.log('🔍 Validating user:');
        console.log('  - Full user:', user);
        console.log('  - Has id:', !!user?.id);
        console.log('  - Has email:', !!user?.email);
        console.log('  - Has role:', !!user?.role);
        
        if (!user || !user.id || !user.email) {
          console.error('❌ Invalid user structure');
          throw new Error('Invalid user data');
        }

        // ✅ ADD: Ensure name exists
        const adminUser = {
          ...user,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        };

        console.log('✅ Auth valid');
        set({ 
          user: adminUser, 
          admin: adminUser, // ✅ Set admin as alias
          isAuthenticated: true 
        });
      } catch (error) {
        console.error('❌ Parse/validation error:', error);
        console.error('  - Raw user string:', userStr);
        StorageManager.removeItem('adminToken');
        StorageManager.removeItem('adminUser');
        set({ 
          user: null, 
          admin: null, // ✅ Clear admin
          isAuthenticated: false 
        });
      }
    } else {
      console.log('❌ No auth data found');
      set({ 
        user: null, 
        admin: null, // ✅ Clear admin
        isAuthenticated: false 
      });
    }
  },
}));