export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  brand: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  color: string;
  price: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  preferences: UserPreferences;
}

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newArrivals: boolean;
  priceDrops: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  image: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  trackingNumber?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Wishlist {
  id: string;
  userId: string;
  products: Product[];
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: Pick<User, 'firstName' | 'lastName' | 'avatar'>;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: Date;
  helpful: number;
}

export interface FilterOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  sizes?: string[];
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating' | 'newest';
}

export interface SearchResult {
  products: Product[];
  total: number;
  page: number;
  hasMore: boolean;
}