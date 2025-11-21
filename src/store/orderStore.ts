// SportShopApp/src/store/orderStore.ts

import { create } from 'zustand';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: any;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  setOrders: (orders) => set({ orders }),

  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),

  updateOrderStatus: (orderId, status) => set((state) => ({
    orders: state.orders.map((order) =>
      order.id === orderId
        ? { ...order, status: status as Order['status'] }
        : order
    ),
  })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearOrders: () => set({ orders: [], error: null }),
}));