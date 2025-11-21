import { create } from 'zustand';
import { Product } from '../types';
import apiService from '../services/api';

interface ProductState {
  products: Product[];
  categories: any[];
  brands: any[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  loading: false,

  fetchProducts: async () => {
    set({ loading: true });
    try {
      const response = await apiService.getProducts();
      if (response.success) {
        set({ products: response.data.data || response.data });
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    } finally {
      set({ loading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        set({ categories: response.data });
      }
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  },

  fetchBrands: async () => {
    try {
      const response = await apiService.getBrands();
      if (response.success) {
        set({ brands: response.data });
      }
    } catch (error) {
      console.error('Fetch brands error:', error);
    }
  },

  createProduct: async (data: any) => {
    set({ loading: true });
    try {
      const response = await apiService.createProduct(data);
      if (response.success) {
        await get().fetchProducts();
      }
    } catch (error: any) {
      console.error('Create product error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateProduct: async (id: string, data: any) => {
    set({ loading: true });
    try {
      const response = await apiService.updateProduct(id, data);
      if (response.success) {
        await get().fetchProducts();
      }
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteProduct: async (id: string) => {
    set({ loading: true });
    try {
      await apiService.deleteProduct(id);
      await get().fetchProducts();
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));