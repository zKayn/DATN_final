// backend/src/types/index.ts

import { Request } from 'express';

// ============= JWT & Auth Types =============
export interface JWTPayload {
  userId: string;
  email: string;
  role?: string;
  type?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ============= Response Types =============
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ============= Product Types =============
export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  categoryId: string;
  brandId: string;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: string[];
  variants?: Array<{
    size?: string;
    color?: string;
    stock: number;
    sku: string;
  }>;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  sku?: string;
  stock?: number;
  categoryId?: string;
  brandId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ProductFilterDTO {
  search?: string;
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============= Order Types =============
export interface CreateOrderDTO {
  items: Array<{
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
  };
  paymentMethod: string;
  shippingMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: string;
  trackingNumber?: string;
  notes?: string;
}

// ============= Category Types =============
export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
  order?: number;
}

// ============= Brand Types =============
export interface CreateBrandDTO {
  name: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export interface UpdateBrandDTO {
  name?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

// ============= Cart Types =============
export interface AddToCartDTO {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemDTO {
  quantity: number;
}

// ============= Review Types =============
export interface CreateReviewDTO {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export interface UpdateReviewDTO {
  rating?: number;
  comment?: string;
  images?: string[];
}

// ============= Coupon Types =============
export interface CreateCouponDTO {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
}

export interface UpdateCouponDTO {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export interface ValidateCouponDTO {
  code: string;
  orderAmount: number;
}