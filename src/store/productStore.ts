// SportShopApp/src/store/productStore.ts

import { create } from 'zustand';
import apiService from '../services/api';
import { Product, Category, Brand } from '../types';

interface ProductState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  featuredProducts: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (categoryId?: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<Product[]>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  featuredProducts: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (categoryId?: string) => {
    try {
      console.log('📦 Fetching products, categoryId:', categoryId);
      set({ isLoading: true, error: null });

      const params = categoryId ? { categoryId } : {};
      const response = await apiService.getProducts(params);

      console.log('📦 Products response:', response);

      if (response.success) {
        const products = response.data || [];
        const featuredProducts = products.filter((p: Product) => p.isFeatured);
        
        console.log('✅ Products loaded:', products.length);
        set({ products, featuredProducts, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('❌ Fetch products error:', error);
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch products',
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      console.log('📁 Fetching categories');
      const response = await apiService.getCategories();

      if (response.success) {
        const categories = response.data || [];
        console.log('✅ Categories loaded:', categories.length);
        set({ categories });
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (error: any) {
      console.error('❌ Fetch categories error:', error);
      set({
        error: error.message || 'Failed to fetch categories',
      });
    }
  },

  fetchBrands: async () => {
    try {
      console.log('🏷️ Fetching brands');
      const response = await apiService.getBrands();

      if (response.success) {
        const brands = response.data || [];
        console.log('✅ Brands loaded:', brands.length);
        set({ brands });
      } else {
        throw new Error(response.message || 'Failed to fetch brands');
      }
    } catch (error: any) {
      console.error('❌ Fetch brands error:', error);
      set({
        error: error.message || 'Failed to fetch brands',
      });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      console.log('🔍 Fetching product by ID:', id);
      set({ isLoading: true, error: null });

      const response = await apiService.getProductById(id);

      if (response.success) {
        const product = response.data;
        console.log('✅ Product loaded:', product?.name);
        set({ selectedProduct: product, isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch product');
      }
    } catch (error: any) {
      console.error('❌ Fetch product error:', error);
      set({
        error: error.message || 'Failed to fetch product',
        isLoading: false,
      });
    }
  },

  searchProducts: async (query: string) => {
    try {
      console.log('🔍 Searching products:', query);
      set({ isLoading: true, error: null });

      const response = await apiService.searchProducts(query);

      if (response.success) {
        const products = response.data || [];
        console.log('✅ Search results:', products.length);
        set({ isLoading: false });
        return products;
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error: any) {
      console.error('❌ Search error:', error);
      set({
        error: error.message || 'Search failed',
        isLoading: false,
      });
      return [];
    }
  },

  clearError: () => set({ error: null }),
}));