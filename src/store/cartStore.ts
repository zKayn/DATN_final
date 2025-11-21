// SportShopApp/src/store/cartStore.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import apiService from '../services/api';

interface CartItem {
  id: string;
  productId: string;
  product: any;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  totalItems: number;
  totalPrice: number;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (product: any, size: string, color: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      
      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get totalPrice() {
        return get().items.reduce((sum, item) => {
          // 🔥 Ưu tiên item.price, fallback sang product.price
          const price = Number(item.price || item.product?.price || 0);
          const quantity = Number(item.quantity || 0);
          console.log('💰 Calculating price:', {
            itemId: item.id,
            itemPrice: item.price,
            productPrice: item.product?.price,
            finalPrice: price,
            quantity,
            subtotal: price * quantity,
          });
          return sum + (price * quantity);
        }, 0);
      },

      fetchCart: async () => {
        try {
          console.log('🛒 Fetching cart');
          set({ isLoading: true });

          const response = await apiService.getCart();

          if (response.success) {
            const items = response.data?.items || [];
            console.log('✅ Cart loaded:', items.length, 'items');
            
            // 🔍 LOG CHI TIẾT
            items.forEach((item: any) => {
              console.log('📦 Cart Item:', {
                id: item.id,
                productName: item.product?.name,
                itemPrice: item.price,
                productPrice: item.product?.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
              });
            });
            
            set({ items, isLoading: false });
          }
        } catch (error: any) {
          console.error('❌ Fetch cart error:', error);
          set({ isLoading: false });
        }
      },

      addToCart: async (product: any, size: string, color: string, quantity = 1) => {
        try {
          console.log('➕ Adding to cart:', {
            productId: product.id,
            productName: product.name,
            price: product.price,
            quantity,
            size,
            color,
          });
          
          set({ isLoading: true });

          const response = await apiService.addToCart({
            productId: product.id,
            quantity,
            size,
            color,
            price: Number(product.price), // 🔥 GỬI GIÁ LÊN BACKEND
          });

          if (response.success) {
            console.log('✅ Added to cart');
            // Refresh cart
            await get().fetchCart();
          }
        } catch (error: any) {
          console.error('❌ Add to cart error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        try {
          console.log('🔄 Updating quantity:', itemId, quantity);
          
          if (quantity <= 0) {
            await get().removeFromCart(itemId);
            return;
          }

          set({ isLoading: true });

          const response = await apiService.updateCartItem(itemId, quantity);

          if (response.success) {
            console.log('✅ Quantity updated');
            await get().fetchCart();
          }
        } catch (error: any) {
          console.error('❌ Update quantity error:', error);
          set({ isLoading: false });
        }
      },

      removeFromCart: async (itemId: string) => {
        try {
          console.log('🗑️ Removing from cart:', itemId);
          set({ isLoading: true });

          const response = await apiService.removeCartItem(itemId);

          if (response.success) {
            console.log('✅ Removed from cart');
            await get().fetchCart();
          }
        } catch (error: any) {
          console.error('❌ Remove from cart error:', error);
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          console.log('🧹 Clearing cart');
          set({ isLoading: true });

          const response = await apiService.clearCart();

          if (response.success) {
            console.log('✅ Cart cleared');
            set({ items: [], isLoading: false });
          }
        } catch (error: any) {
          console.error('❌ Clear cart error:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
