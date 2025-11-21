export const API_CONFIG = {
  // Thay đổi IP này thành IP máy tính của bạn
  BASE_URL: 'http://192.168.1.187:5000/api',
  
  // Timeout
  TIMEOUT: 30000,
  
  // Headers
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh-token',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
    FEATURED: '/products/featured',
    SEARCH: '/products/search',
    BY_CATEGORY: (categoryId: string) => `/products/category/${categoryId}`,
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },
  
  // Brands
  BRANDS: {
    LIST: '/brands',
    DETAIL: (id: string) => `/brands/${id}`,
  },
  
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: (itemId: string) => `/cart/${itemId}`,
    REMOVE: (itemId: string) => `/cart/${itemId}`,
    CLEAR: '/cart/clear',
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },
  
  // User
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    CHANGE_PASSWORD: '/user/change-password',
    ADDRESSES: '/user/addresses',
  },

  // ✅ REVIEWS - NEW
  REVIEWS: {
    LIST: '/reviews',
    MY_REVIEWS: '/reviews/my-reviews',
    PRODUCT_REVIEWS: (productId: string) => `/reviews/products/${productId}`,
    CREATE: '/reviews',
    UPDATE: (reviewId: string) => `/reviews/${reviewId}`,
    DELETE: (reviewId: string) => `/reviews/${reviewId}`,
    HELPFUL: (reviewId: string) => `/reviews/${reviewId}/helpful`,
    CAN_REVIEW: (productId: string) => `/reviews/products/${productId}/can-review`,
  },
};