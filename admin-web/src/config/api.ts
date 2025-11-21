// admin-web/src/config/api.ts

export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.187:5000/api', // 🔥 SAME AS MOBILE
  TIMEOUT: 60000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    CREATE: '/products',
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
    FEATURED: '/products/featured',
    SEARCH: '/products/search',
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
    CREATE: '/categories',
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },
  BRANDS: {
    LIST: '/brands',
    DETAIL: (id: string) => `/brands/${id}`,
    CREATE: '/brands',
    UPDATE: (id: string) => `/brands/${id}`,
    DELETE: (id: string) => `/brands/${id}`,
  },
  ORDERS: {
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    STATS: '/orders/stats',
  },
  USERS: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    STATS: '/users/stats',
  },
  DASHBOARD: {
    STATS: '/dashboard/stats',
    REVENUE: '/dashboard/revenue',
    RECENT_ORDERS: '/dashboard/recent-orders',
    TOP_PRODUCTS: '/dashboard/top-products',
  },
};