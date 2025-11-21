export const COLORS = {
  primary: '#FF6B35',
  secondary: '#004E89',
  accent: '#FFD23F',
  dark: '#1A1A1A',
  light: '#F8F9FA',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
};

export const CATEGORIES = [
  { id: '1', name: 'Football', icon: '⚽', image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400', productCount: 0 },
  { id: '2', name: 'Basketball', icon: '🏀', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400', productCount: 0 },
  { id: '3', name: 'Running', icon: '🏃', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', productCount: 0 },
  { id: '4', name: 'Tennis', icon: '🎾', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', productCount: 0 },
  { id: '5', name: 'Swimming', icon: '🏊', image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400', productCount: 0 },
  { id: '6', name: 'Gym', icon: '🏋️', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', productCount: 0 },
];

export const BRANDS = [
  { id: '1', name: 'Nike', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png', description: '' },
  { id: '2', name: 'Adidas', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png', description: '' },
  { id: '3', name: 'Puma', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png', description: '' },
  { id: '4', name: 'Under Armour', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Under-Armour-Logo.png', description: '' },
];

// Import MOCK_PRODUCTS từ file mockData
export * from './mockData';

export const SHIPPING_OPTIONS = [
  { id: 'standard', name: 'Standard Shipping', price: 5, duration: '5-7 days' },
  { id: 'express', name: 'Express Shipping', price: 15, duration: '2-3 days' },
  { id: 'overnight', name: 'Overnight Shipping', price: 25, duration: '1 day' },
];

export const PAYMENT_METHODS = [
  { id: 'credit_card', name: 'Credit Card', icon: '💳' },
  { id: 'paypal', name: 'PayPal', icon: '📱' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '📲' },
  { id: 'google_pay', name: 'Google Pay', icon: '📲' },
];

export const API_ENDPOINTS = {
  BASE_URL: 'http://192.168.1.68:5000/api',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    BRANDS: '/products/brands',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    ADDRESSES: '/user/addresses',
    ORDERS: '/user/orders',
    WISHLIST: '/user/wishlist',
  },
  CART: '/cart',
  ORDERS: '/orders',
  REVIEWS: '/reviews',
};