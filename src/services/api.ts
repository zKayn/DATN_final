// SportShopApp/src/services/api.ts
// ✅ UPDATED WITH WISHLIST METHODS

import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    console.log('🔧 API Service initialized');
    console.log('🌐 BASE_URL:', API_CONFIG.BASE_URL);

    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        console.log('📤 REQUEST:', config.method?.toUpperCase(), config.url);
        console.log('📦 Body:', config.data);
        
        // 🔥 KHÔNG gửi token cho login/register
        const isAuthEndpoint = config.url?.includes('/auth/login') || 
                              config.url?.includes('/auth/register');
        
        if (!isAuthEndpoint) {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('🔐 Token added');
          }
        } else {
          console.log('🚫 Skipping token for auth endpoint');
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ RESPONSE:', response.status, response.config.url);
        console.log('📦 Data:', response.data);
        return response;
      },
      async (error: AxiosError) => {
        console.error('❌ RESPONSE ERROR:');
        console.error('   Status:', error.response?.status);
        console.error('   Data:', error.response?.data);
        console.error('   Message:', error.message);
        
        if (error.response?.status === 401) {
          await this.handleTokenRefresh();
        }
        return Promise.reject(error);
      }
    );
  }

  private async handleTokenRefresh() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
    } catch (error) {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    }
  }

  // ============= Auth APIs =============
  async login(email: string, password: string) {
    console.log('🔵 Login API called');
    console.log('📧 Email:', email);
    console.log('🔗 URL:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`);
    
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.LOGIN, { 
        email, 
        password 
      });
      console.log('✅ Login success');
      return response.data;
    } catch (error: any) {
      console.error('❌ Login failed');
      throw error;
    }
  }

  async register(data: any) {
    console.log('🔵 Register API called');
    console.log('📧 Email:', data.email);
    console.log('🔗 URL:', `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
    
    try {
      const response = await this.api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      console.log('✅ Register success');
      return response.data;
    } catch (error: any) {
      console.error('❌ Register failed');
      throw error;
    }
  }

  async getProfile() {
    const response = await this.api.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put(API_ENDPOINTS.AUTH.PROFILE, data);
    return response.data;
  }

  async logout() {
    const response = await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  }

  // ============= Product APIs =============
  async getProducts(params?: any) {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS.LIST, { params });
    return response.data;
  }

  async getProductById(id: string) {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    return response.data;
  }

  async getFeaturedProducts() {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS.FEATURED);
    return response.data;
  }

  async searchProducts(query: string) {
    const response = await this.api.get(API_ENDPOINTS.PRODUCTS.SEARCH, {
      params: { q: query },
    });
    return response.data;
  }

  // ============= Category APIs =============
  async getCategories() {
    const response = await this.api.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data;
  }

  // ============= Brand APIs =============
  async getBrands() {
    const response = await this.api.get(API_ENDPOINTS.BRANDS.LIST);
    return response.data;
  }

  // ============= Cart APIs =============
  async getCart() {
    const response = await this.api.get(API_ENDPOINTS.CART.GET);
    return response.data;
  }

  async addToCart(data: {
    productId: string;
    quantity: number;
    size?: string;
    color?: string;
    price?: number;
  }) {
    console.log('🛒 Adding to cart with data:', data);
    const response = await this.api.post(API_ENDPOINTS.CART.ADD, data);
    return response.data;
  }

  async updateCartItem(id: string, quantity: number) {
    const response = await this.api.put(API_ENDPOINTS.CART.UPDATE(id), { quantity });
    return response.data;
  }

  async removeCartItem(id: string) {
    const response = await this.api.delete(API_ENDPOINTS.CART.REMOVE(id));
    return response.data;
  }

  async clearCart() {
    const response = await this.api.delete(API_ENDPOINTS.CART.CLEAR);
    return response.data;
  }

  // ============= Order APIs =============
  async createOrder(data: any) {
    const response = await this.api.post(API_ENDPOINTS.ORDERS.CREATE, data);
    return response.data;
  }

  async getOrders() {
    const response = await this.api.get(API_ENDPOINTS.ORDERS.LIST);
    return response.data;
  }

  async getUserOrders(page = 1, limit = 20) {
    console.log('📦 Getting user orders...');
    const response = await this.api.get(API_ENDPOINTS.ORDERS.LIST, {
      params: { page, limit },
    });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await this.api.get(API_ENDPOINTS.ORDERS.DETAIL(id));
    return response.data;
  }

  async cancelOrder(id: string, reason?: string) {
    const response = await this.api.put(API_ENDPOINTS.ORDERS.CANCEL(id), { reason });
    return response.data;
  }

  async getOrderByNumber(orderNumber: string) {
    console.log('📦 Getting order by number:', orderNumber);
    const response = await this.api.get(`/orders/number/${orderNumber}`);
    return response.data;
  }

  // ============= REVIEW APIs =============
  
  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      rating?: number;
      sortBy?: 'recent' | 'helpful' | 'rating';
    }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    console.log('⭐ Getting product reviews:', productId);
    const response = await this.api.get(
      `/reviews/products/${productId}?${queryParams.toString()}`
    );
    return response.data;
  }

  /**
   * Create review
   */
  async createReview(data: {
    productId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    console.log('📝 Creating review for product:', data.productId);
    console.log('📤 REQUEST: POST /reviews');
    console.log('📦 Body:', {
      ...data,
      images: data.images ? `[${data.images.length} images]` : undefined,
    });

    try {
      const response = await this.api.post('/reviews', data);
      console.log('✅ Review created successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Create review error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update review - ✅ FIXED: Use PATCH instead of PUT
   */
  async updateReview(
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      images?: string[];
    }
  ) {
    console.log('✏️ Updating review:', reviewId);
    console.log('📤 REQUEST: PATCH /reviews/' + reviewId);
    console.log('📦 Body:', data);

    try {
      const response = await this.api.patch(`/reviews/${reviewId}`, data);
      console.log('✅ Review updated successfully');
      console.log('📦 Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Update review error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete review
   */
  async deleteReview(reviewId: string) {
    console.log('🗑️ Deleting review:', reviewId);
    console.log('📤 REQUEST: DELETE /reviews/' + reviewId);

    try {
      const response = await this.api.delete(`/reviews/${reviewId}`);
      console.log('✅ Review deleted successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Delete review error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Mark review as helpful
   */
  async markReviewHelpful(reviewId: string) {
    console.log('👍 Marking review as helpful:', reviewId);
    const response = await this.api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  }

  /**
   * Get my reviews
   */
  async getMyReviews(params?: { page?: number; limit?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    console.log('📋 Getting my reviews');
    const response = await this.api.get(`/reviews/my-reviews?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Check if user can review product
   */
  async canReviewProduct(productId: string) {
    console.log('🔍 Checking if can review product:', productId);
    const response = await this.api.get(`/reviews/products/${productId}/can-review`);
    return response.data;
  }

  // ============= WISHLIST APIs - ✅ NEW =============
  
  /**
   * Get user's wishlist
   */
  async getWishlist(params?: {
    page?: number;
    limit?: number;
  }) {
    console.log('❤️ Getting wishlist...');
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    try {
      const response = await this.api.get(`/wishlist?${queryParams.toString()}`);
      console.log('✅ Wishlist fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(productId: string) {
    console.log('❤️ Adding to wishlist:', productId);
    console.log('📤 REQUEST: POST /wishlist');
    console.log('📦 Body:', { productId });

    try {
      const response = await this.api.post('/wishlist', { productId });
      console.log('✅ Added to wishlist successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Add to wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(productId: string) {
    console.log('💔 Removing from wishlist:', productId);
    console.log('📤 REQUEST: DELETE /wishlist/' + productId);

    try {
      const response = await this.api.delete(`/wishlist/${productId}`);
      console.log('✅ Removed from wishlist successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Remove from wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Toggle wishlist (add/remove)
   */
  async toggleWishlist(productId: string) {
    console.log('🔄 Toggling wishlist:', productId);
    console.log('📤 REQUEST: POST /wishlist/toggle');
    console.log('📦 Body:', { productId });

    try {
      const response = await this.api.post('/wishlist/toggle', { productId });
      console.log('✅ Wishlist toggled:', response.data.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Toggle wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Check if product is in wishlist
   */
  async checkWishlist(productId: string) {
    console.log('🔍 Checking wishlist status:', productId);
    console.log('📤 REQUEST: GET /wishlist/check/' + productId);

    try {
      const response = await this.api.get(`/wishlist/check/${productId}`);
      console.log('✅ Wishlist status:', response.data.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Check wishlist error:', error.response?.data || error.message);
      return { data: { inWishlist: false } };
    }
  }

  /**
   * Get wishlist count
   */
  async getWishlistCount() {
    console.log('🔢 Getting wishlist count...');
    console.log('📤 REQUEST: GET /wishlist/count');

    try {
      const response = await this.api.get('/wishlist/count');
      console.log('✅ Wishlist count:', response.data.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Get wishlist count error:', error.response?.data || error.message);
      return { data: { count: 0 } };
    }
  }

  /**
   * Clear all wishlist items
   */
  async clearWishlist() {
    console.log('🗑️ Clearing wishlist...');
    console.log('📤 REQUEST: DELETE /wishlist');

    try {
      const response = await this.api.delete('/wishlist');
      console.log('✅ Wishlist cleared successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Clear wishlist error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new ApiService();