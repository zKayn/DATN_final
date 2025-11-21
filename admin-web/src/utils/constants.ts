// API Base URL - Sẽ thay đổi khi có backend
export const API_BASE_URL = 'http://localhost:5000/api';


// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/admin/auth/login',
    LOGOUT: '/admin/auth/logout',
    REFRESH: '/admin/auth/refresh',
    ME: '/admin/auth/me',
    CHANGE_PASSWORD: '/admin/auth/change-password',
  },
  
  // Products
  PRODUCTS: {
    LIST: '/admin/products',
    CREATE: '/admin/products',
    UPDATE: '/admin/products/:id',
    DELETE: '/admin/products/:id',
    BULK_UPDATE: '/admin/products/bulk-update',
    BULK_DELETE: '/admin/products/bulk-delete',
    UPLOAD_IMAGE: '/admin/products/upload-image',
  },
  
  // Categories
  CATEGORIES: {
    LIST: '/admin/categories',
    CREATE: '/admin/categories',
    UPDATE: '/admin/categories/:id',
    DELETE: '/admin/categories/:id',
  },
  
  // Brands
  BRANDS: {
    LIST: '/admin/brands',
    CREATE: '/admin/brands',
    UPDATE: '/admin/brands/:id',
    DELETE: '/admin/brands/:id',
  },
  
  // Orders
  ORDERS: {
    LIST: '/admin/orders',
    DETAIL: '/admin/orders/:id',
    UPDATE_STATUS: '/admin/orders/:id/status',
    UPDATE_PAYMENT: '/admin/orders/:id/payment',
    ADD_TRACKING: '/admin/orders/:id/tracking',
    CANCEL: '/admin/orders/:id/cancel',
    REFUND: '/admin/orders/:id/refund',
    EXPORT: '/admin/orders/export',
  },
  
  // Customers
  CUSTOMERS: {
    LIST: '/admin/customers',
    DETAIL: '/admin/customers/:id',
    UPDATE: '/admin/customers/:id',
    BLOCK: '/admin/customers/:id/block',
    UNBLOCK: '/admin/customers/:id/unblock',
    ORDERS: '/admin/customers/:id/orders',
    EXPORT: '/admin/customers/export',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/admin/reviews',
    APPROVE: '/admin/reviews/:id/approve',
    REJECT: '/admin/reviews/:id/reject',
    RESPOND: '/admin/reviews/:id/respond',
    DELETE: '/admin/reviews/:id',
  },
  
  // Coupons
  COUPONS: {
    LIST: '/admin/coupons',
    CREATE: '/admin/coupons',
    UPDATE: '/admin/coupons/:id',
    DELETE: '/admin/coupons/:id',
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
    REVENUE_CHART: '/admin/dashboard/revenue',
    TOP_PRODUCTS: '/admin/dashboard/top-products',
    RECENT_ORDERS: '/admin/dashboard/recent-orders',
  },
  
  // Inventory
  INVENTORY: {
    LOGS: '/admin/inventory/logs',
    UPDATE_STOCK: '/admin/inventory/update-stock',
    LOW_STOCK: '/admin/inventory/low-stock',
  },
  
  // Settings
  SETTINGS: {
    GET: '/admin/settings',
    UPDATE: '/admin/settings',
    UPLOAD_LOGO: '/admin/settings/upload-logo',
  },
  
  // Analytics
  ANALYTICS: {
    SALES: '/admin/analytics/sales',
    CUSTOMERS: '/admin/analytics/customers',
    PRODUCTS: '/admin/analytics/products',
    EXPORT: '/admin/analytics/export',
  },
};

// Order Status Config
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    icon: 'Clock',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    icon: 'CheckCircle',
  },
  processing: {
    label: 'Processing',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    icon: 'Package',
  },
  shipped: {
    label: 'Shipped',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800',
    icon: 'Truck',
  },
  delivered: {
    label: 'Delivered',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    icon: 'CheckCircle2',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    icon: 'XCircle',
  },
  refunded: {
    label: 'Refunded',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    icon: 'RotateCcw',
  },
};

// Payment Status Config
export const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  paid: {
    label: 'Paid',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  failed: {
    label: 'Failed',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
  refunded: {
    label: 'Refunded',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
  },
};

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date Formats
export const DATE_FORMAT = 'dd/MM/yyyy';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
export const TIME_FORMAT = 'HH:mm';

// Currency
export const CURRENCY_SYMBOL = '$';
export const CURRENCY_CODE = 'USD';

// Image Upload
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Product
export const DEFAULT_PRODUCT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const DEFAULT_PRODUCT_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#10B981' },
  { name: 'Yellow', hex: '#FFD23F' },
  { name: 'Gray', hex: '#6B7280' },
];

// Chart Colors
export const CHART_COLORS = [
  '#FF6B35',
  '#004E89',
  '#FFD23F',
  '#10B981',
  '#EF4444',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

// Sidebar Menu Items
export const SIDEBAR_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    icon: 'LayoutDashboard',
  },
  {
    id: 'products',
    label: 'Products',
    path: '/admin/products',
    icon: 'Package',
  },
  {
    id: 'orders',
    label: 'Orders',
    path: '/admin/orders',
    icon: 'ShoppingCart',
  },
  {
    id: 'categories',
    label: 'Categories',
    path: '/admin/categories',
    icon: 'FolderTree',
  },
  {
    id: 'brands',
    label: 'Brands',
    path: '/admin/brands',
    icon: 'Tags',
  },
  {
    id: 'customers',
    label: 'Customers',
    path: '/admin/customers',
    icon: 'Users',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    path: '/admin/reviews',
    icon: 'Star',
  },
  // ✅ ADD THIS
  {
    id: 'wishlists',
    label: 'Wishlists',
    path: '/admin/wishlists',
    icon: 'Heart',
  },
  {
    id: 'coupons',
    label: 'Coupons',
    path: '/admin/coupons',
    icon: 'Ticket',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/admin/analytics',
    icon: 'BarChart3',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/admin/settings',
    icon: 'Settings',
  },
];

// Permissions
export const PERMISSIONS = {
  // Products
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',
  
  // Orders
  ORDERS_VIEW: 'orders.view',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_CANCEL: 'orders.cancel',
  ORDERS_REFUND: 'orders.refund',
  
  // Customers
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_BLOCK: 'customers.block',
  
  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  ANALYTICS_EXPORT: 'analytics.export',
};

// Role Permissions
export const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  admin: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_CANCEL,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_UPDATE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  manager: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.CUSTOMERS_VIEW,
  ],
  staff: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
  ],
};

// Stock Alert Threshold
export const LOW_STOCK_THRESHOLD = 10;

// Export Formats
export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_NEW: 'order_new',
  ORDER_CANCELLED: 'order_cancelled',
  PRODUCT_LOW_STOCK: 'product_low_stock',
  REVIEW_NEW: 'review_new',
  CUSTOMER_NEW: 'customer_new',
  SYSTEM_UPDATE: 'system_update',
} as const;

