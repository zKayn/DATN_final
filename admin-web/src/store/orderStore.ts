import { create } from 'zustand';
import { Order, OrderStatus, PaymentStatus } from '../types';
import apiService from '../services/api';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  updatePaymentStatus: (id: string, status: PaymentStatus) => Promise<void>;
  addTrackingNumber: (id: string, trackingNumber: string, carrierName: string) => Promise<void>;
  cancelOrder: (id: string, reason: string) => Promise<void>;
  setSelectedOrder: (order: Order | null) => void;
}

// Helper function to transform backend order to frontend Order type
const transformOrder = (backendOrder: any): Order => {
  console.log('🔄 Transforming order:', backendOrder.id);
  console.log('🔍 Backend order keys:', Object.keys(backendOrder));
  
  // Parse shipping address if it's a string
  let shippingAddress = backendOrder.shippingAddress || backendOrder.shipping_address;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch (e) {
      console.error('❌ Failed to parse shipping address:', e);
      shippingAddress = {
        id: 'default',
        fullName: 'Unknown',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      };
    }
  }

  const transformed: Order = {
    id: backendOrder.id,
    orderNumber: backendOrder.orderNumber || backendOrder.order_number || 'N/A',
    customerId: backendOrder.userId || backendOrder.user_id || '',
    
    // Customer info
    customer: {
      id: backendOrder.user?.id || backendOrder.userId || backendOrder.user_id || '',
      firstName: backendOrder.user?.firstName || backendOrder.user?.first_name || 'N/A',
      lastName: backendOrder.user?.lastName || backendOrder.user?.last_name || '',
      email: backendOrder.user?.email || 'no-email@example.com',
      phone: backendOrder.user?.phone || '',
    },

    // Order items
    items: (backendOrder.items || []).map((item: any) => ({
      id: item.id,
      productId: item.productId || item.product_id,
      product: {
        id: item.product?.id || '',
        name: item.product?.name || 'Unknown Product',
        sku: item.product?.sku || 'N/A',
        images: item.product?.images?.map((img: any) => img.url) || [],
      },
      quantity: item.quantity || 1,
      size: item.size || '',
      color: item.color || '',
      price: Number(item.price || 0),
      originalPrice: Number(item.originalPrice || item.original_price || item.price || 0),
      discount: Number(item.discount || 0),
      total: Number(item.price || 0) * (item.quantity || 1),
      status: 'confirmed',
    })),

    // Pricing
    subtotal: Number(backendOrder.subtotal || 0),
    shipping: Number(backendOrder.shippingFee || backendOrder.shipping_fee || 0),
    shippingFee: Number(backendOrder.shippingFee || backendOrder.shipping_fee || 0),
    tax: Number(backendOrder.tax || 0),
    discount: Number(backendOrder.discount || 0),
    total: Number(backendOrder.total || 0),

    // Status
    status: (backendOrder.status || 'PENDING') as OrderStatus,
    paymentMethod: backendOrder.paymentMethod || backendOrder.payment_method || 'cash',
    paymentStatus: (backendOrder.paymentStatus || backendOrder.payment_status || 'PENDING') as PaymentStatus,

    // Shipping info
    shippingAddress,
    shippingMethod: backendOrder.shippingMethod || backendOrder.shipping_method || 'standard',
    trackingNumber: backendOrder.trackingNumber || backendOrder.tracking_number || '',
    carrierName: backendOrder.carrierName || backendOrder.carrier_name || '',

    // Additional info
    notes: backendOrder.notes || '',
    cancelReason: backendOrder.cancelReason || backendOrder.cancel_reason || '',

    // Timestamps
    createdAt: backendOrder.createdAt || backendOrder.created_at || new Date().toISOString(),
    updatedAt: backendOrder.updatedAt || backendOrder.updated_at || new Date().toISOString(),
    confirmedAt: backendOrder.confirmedAt || backendOrder.confirmed_at,
    shippedAt: backendOrder.shippedAt || backendOrder.shipped_at,
    deliveredAt: backendOrder.deliveredAt || backendOrder.delivered_at,
    cancelledAt: backendOrder.cancelledAt || backendOrder.cancelled_at,
  };

  console.log('✅ Transformed order:', {
    id: transformed.id,
    status: transformed.status,
    paymentStatus: transformed.paymentStatus,
    hasCustomer: !!transformed.customer,
    itemsCount: transformed.items.length,
  });

  return transformed;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  total: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    console.log('📦 OrderStore: Fetching orders...');
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getOrders();
      console.log('📦 OrderStore: Orders response:', response);

      if (response.success) {
        const ordersData = response.data.data || response.data;
        const transformedOrders = ordersData.map(transformOrder);
        console.log('✅ OrderStore: Orders loaded:', transformedOrders.length);
        
        set({
          orders: transformedOrders,
          total: transformedOrders.length,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('❌ OrderStore: Fetch orders error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch orders',
        isLoading: false,
      });
    }
  },

  fetchOrderById: async (id: string) => {
    console.log('📦 OrderStore: Fetching order by ID:', id);
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getOrderById(id);
      console.log('📦 OrderStore: Order response:', response);

      if (response.success) {
        const orderData = response.data;
        console.log('🔍 Raw order data:', orderData);
        
        const transformedOrder = transformOrder(orderData);
        console.log('✅ OrderStore: Order transformed and loaded');
        
        set({
          selectedOrder: transformedOrder,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('❌ OrderStore: Fetch order error:', error);
      set({
        error: error.response?.data?.message || 'Failed to fetch order',
        isLoading: false,
        selectedOrder: null,
      });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    console.log('📦 OrderStore: Updating order status:', id, status);
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.updateOrderStatus(id, { status });
      console.log('✅ OrderStore: Status updated:', response);

      if (response.success) {
        await get().fetchOrderById(id);
        await get().fetchOrders();
      } else {
        throw new Error('Failed to update status');
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('❌ OrderStore: Update status error:', error);
      set({
        error: error.response?.data?.message || 'Failed to update order status',
        isLoading: false,
      });
      throw error;
    }
  },

  updatePaymentStatus: async (id: string, status: PaymentStatus) => {
    console.log('📦 OrderStore: Updating payment status:', id, status);
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.updateOrderStatus(id, { paymentStatus: status });
      console.log('✅ OrderStore: Payment status updated:', response);

      if (response.success) {
        await get().fetchOrderById(id);
      } else {
        throw new Error('Failed to update payment status');
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('❌ OrderStore: Update payment status error:', error);
      set({
        error: error.response?.data?.message || 'Failed to update payment status',
        isLoading: false,
      });
      throw error;
    }
  },

  addTrackingNumber: async (id: string, trackingNumber: string, carrierName: string) => {
    console.log('📦 OrderStore: Adding tracking number:', id, trackingNumber, carrierName);
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.updateOrderStatus(id, { 
        trackingNumber,
        carrierName,
        status: OrderStatus.SHIPPED,
      });
      console.log('✅ OrderStore: Tracking number added:', response);

      if (response.success) {
        await get().fetchOrderById(id);
      } else {
        throw new Error('Failed to add tracking number');
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('❌ OrderStore: Add tracking error:', error);
      set({
        error: error.response?.data?.message || 'Failed to add tracking number',
        isLoading: false,
      });
      throw error;
    }
  },

  cancelOrder: async (id: string, reason: string) => {
    console.log('📦 OrderStore: Cancelling order:', id, reason);
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.updateOrderStatus(id, { 
        status: OrderStatus.CANCELLED,
        notes: reason,
      });
      console.log('✅ OrderStore: Order cancelled:', response);

      if (response.success) {
        await get().fetchOrderById(id);
      } else {
        throw new Error('Failed to cancel order');
      }

      set({ isLoading: false });
    } catch (error: any) {
      console.error('❌ OrderStore: Cancel order error:', error);
      set({
        error: error.response?.data?.message || 'Failed to cancel order',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },
}));