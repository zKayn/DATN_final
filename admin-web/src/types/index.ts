// Admin User Types
export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'staff';
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

// Product Types (sync với mobile app)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  brand: string;
  brandId: string;
  sizes: string[];
  colors: string[];
  stock: number;
  lowStockThreshold: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  isNew: boolean;
  discount?: number;
  sku: string;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parentId?: string;
  productCount: number;
  isActive: boolean;
  order: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Brand Types
export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website?: string;
  isActive: boolean;
  isFeatured: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Customer Types
export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  addresses: Address[];
  status: 'active' | 'inactive' | 'blocked';
  loyaltyPoints: number;
  customerTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferences: {
    newsletter: boolean;
    smsNotifications: boolean;
    emailNotifications: boolean;
  };
  createdAt: string;
  lastOrderAt?: string;
  notes?: string;
}

// Address Types
export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  email?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

// Order Types
export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: string;
  trackingNumber?: string;
  carrierName?: string;
  notes?: string;
  adminNotes?: string;
  couponCode?: string;
  couponDiscount?: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  cancelReason?: string;
  refundAmount?: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
  quantity: number;
  size: string;
  color: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
  CASH_ON_DELIVERY = 'cash_on_delivery',
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  customerId: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  isVerifiedPurchase: boolean;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  perCustomerLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableProducts?: string[];
  applicableCategories?: string[];
  excludeProducts?: string[];
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  topSellingProducts: {
    product: Product;
    quantitySold: number;
    revenue: number;
  }[];
  recentOrders: Order[];
  revenueByDay: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  ordersByStatus: {
    status: OrderStatus;
    count: number;
  }[];
  topCategories: {
    category: Category;
    revenue: number;
    orders: number;
  }[];
}

// Inventory Types
export interface InventoryLog {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
  type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damaged';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  referenceNumber?: string;
  orderId?: string;
  createdBy: string;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'order' | 'product' | 'customer' | 'review' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Settings Types
export interface Settings {
  id: string;
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: Address;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  taxRate: number;
  shippingMethods: ShippingMethod[];
  paymentGateways: PaymentGateway[];
  emailSettings: EmailSettings;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  maintenanceMode: boolean;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface PaymentGateway {
  id: string;
  name: string;
  apiKey?: string;
  secretKey?: string;
  isActive: boolean;
  isSandbox: boolean;
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

// Filter/Query Types
export interface ProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  sortBy?: 'name' | 'price' | 'createdAt' | 'stock' | 'rating';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'orderNumber' | 'createdAt' | 'total';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}