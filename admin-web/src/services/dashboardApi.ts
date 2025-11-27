// admin-web/src/services/dashboardApi.ts

import apiService from './api';

// ✅ FIXED: Interface khớp với backend response
export interface OverviewStats {
  revenue: {
    total: number;
    change: number;
  };
  orders: {
    total: number;
    pending: number;
    processing: number;
  };
  customers: {
    total: number;
    change: number;
  };
  products: {
    total: number;
  };
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface TopProduct {
  product: {
    id: string;
    name: string;
    price: number;
    images: Array<{ imageUrl: string }>;
    category: { name: string };
  };
  totalSold: number;
  totalRevenue: number;
}

export interface TopCustomer {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  totalSpent: number;
  totalOrders: number;
}

export interface CategoryStat {
  id: string;
  name: string;
  productCount: number;
  revenue: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
      images: Array<{ imageUrl: string }>;
    };
  }>;
}

export interface SalesComparison {
  thisYear: {
    revenue: number;
    orders: number;
  };
  lastYear: {
    revenue: number;
    orders: number;
  };
  change: {
    revenue: number;
    orders: number;
  };
}

const dashboardApi = {
  /**
   * Get overview statistics
   */
  getOverview: async (): Promise<OverviewStats> => {
    const response = await apiService.get('/admin/dashboard/overview');
    console.log('📊 Overview response:', response.data);
    return response.data.data;
  },

  /**
   * Get revenue chart data
   */
  getRevenueChart: async (
    period: 'week' | 'month' | 'year' = 'month'
  ): Promise<RevenueChartData[]> => {
    const response = await apiService.get('/admin/dashboard/revenue', {
      params: { period },
    });
    return response.data.data;
  },

  /**
   * Get top selling products
   */
  getTopProducts: async (limit = 10): Promise<TopProduct[]> => {
    const response = await apiService.get('/admin/dashboard/top-products', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get top customers
   */
  getTopCustomers: async (limit = 10): Promise<TopCustomer[]> => {
    const response = await apiService.get('/admin/dashboard/top-customers', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get category statistics
   */
  getCategoryStats: async (): Promise<CategoryStat[]> => {
    const response = await apiService.get('/admin/dashboard/categories');
    return response.data.data;
  },

  /**
   * Get recent orders
   */
  getRecentOrders: async (limit = 10): Promise<RecentOrder[]> => {
    const response = await apiService.get('/admin/dashboard/recent-orders', {
      params: { limit },
    });
    return response.data.data;
  },

  /**
   * Get sales comparison
   */
  getSalesComparison: async (): Promise<SalesComparison> => {
    const response = await apiService.get('/admin/dashboard/sales-comparison');
    return response.data.data;
  },
};

export default dashboardApi;