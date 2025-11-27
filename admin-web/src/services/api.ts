// admin-web/src/services/api.ts
// ✅ FIXED: Added Wishlist APIs

import axios, { AxiosInstance, AxiosError } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'http://192.168.1.68:5000/api',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add token
    this.api.interceptors.request.use(
      async (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        console.error('❌ API Error:', error.response?.status, error.response?.data);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          const currentPath = window.location.pathname;
          
          if (currentPath !== '/login') {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async adminLogin(email: string, password: string) {
    const response = await this.api.post('/admin/auth/login', { email, password });
    return response.data;
  }

  // Orders
  async getOrders(params?: any) {
    const response = await this.api.get('/admin/orders', { params });
    return response.data;
  }

  async getOrderById(id: string) {
    const response = await this.api.get(`/admin/orders/${id}`);
    return response.data;
  }

  async getOrderStats() {
    const response = await this.api.get('/admin/orders/stats');
    return response.data;
  }

  async updateOrderStatus(id: string, data: { status: string; trackingNumber?: string; notes?: string }) {
    const response = await this.api.put(`/admin/orders/${id}/status`, data);
    return response.data;
  }

  // Customers
  async getCustomers(params?: any) {
    const response = await this.api.get('/admin/customers', { params });
    return response.data;
  }

  async getCustomerById(id: string) {
    const response = await this.api.get(`/admin/customers/${id}`);
    return response.data;
  }

  async getCustomerStats() {
    const response = await this.api.get('/admin/customers/stats');
    return response.data;
  }

  async updateCustomerStatus(id: string, data: { isActive: boolean }) {
    const response = await this.api.put(`/admin/customers/${id}/status`, data);
    return response.data;
  }

  // ============= Product APIs - ✅ FIXED =============
  async getProducts(params?: any) {
    // ✅ Public route for listing (no auth needed for view)
    const response = await this.api.get('/products', { params });
    return response.data;
  }

  async getProductById(id: string) {
    // ✅ Public route for detail view
    const response = await this.api.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(data: any) {
    // ✅ FIXED: Use /admin/products for create
    const response = await this.api.post('/admin/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: any) {
    // ✅ FIXED: Use /admin/products for update
    const response = await this.api.put(`/admin/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string) {
    // ✅ FIXED: Use /admin/products for delete
    const response = await this.api.delete(`/admin/products/${id}`);
    return response.data;
  }

  // Categories
  async getCategories(params?: any) {
    const response = await this.api.get('/admin/categories', { params });
    return response.data;
  }

  async getCategoryById(id: string) {
    const response = await this.api.get(`/admin/categories/${id}`);
    return response.data;
  }

  async createCategory(data: any) {
    const response = await this.api.post('/admin/categories', data);
    return response.data;
  }

  async updateCategory(id: string, data: any) {
    const response = await this.api.put(`/admin/categories/${id}`, data);
    return response.data;
  }

  async deleteCategory(id: string) {
    const response = await this.api.delete(`/admin/categories/${id}`);
    return response.data;
  }

  // Brands
  async getBrands(params?: any) {
    const response = await this.api.get('/admin/brands', { params });
    return response.data;
  }

  async getBrandById(id: string) {
    const response = await this.api.get(`/admin/brands/${id}`);
    return response.data;
  }

  async createBrand(data: any) {
    const response = await this.api.post('/admin/brands', data);
    return response.data;
  }

  async updateBrand(id: string, data: any) {
    const response = await this.api.put(`/admin/brands/${id}`, data);
    return response.data;
  }

  async deleteBrand(id: string) {
    const response = await this.api.delete(`/admin/brands/${id}`);
    return response.data;
  }

  // Reviews
  async getReviews(params?: any) {
    const response = await this.api.get('/admin/reviews', { params });
    return response.data;
  }

  async getAllReviews(params?: {
    page?: number;
    limit?: number;
    status?: 'all' | 'pending' | 'approved';
    rating?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.rating) queryParams.append('rating', params.rating.toString());

    const response = await this.api.get(`/admin/reviews?${queryParams.toString()}`);
    return response.data;
  }

  async getReviewStats() {
    const response = await this.api.get('/admin/reviews/stats');
    return response.data;
  }

  async approveReview(reviewId: string) {
    const response = await this.api.put(`/admin/reviews/${reviewId}/approve`);
    return response.data;
  }

  async rejectReview(reviewId: string) {
    const response = await this.api.put(`/admin/reviews/${reviewId}/reject`);
    return response.data;
  }

  async replyToReview(reviewId: string, reply: string) {
    const response = await this.api.put(`/admin/reviews/${reviewId}/reply`, { reply });
    return response.data;
  }

  async updateReviewStatus(id: string, data: { status: string }) {
    const response = await this.api.patch(`/admin/reviews/${id}/status`, data);
    return response.data;
  }

  async deleteReview(id: string) {
    const response = await this.api.delete(`/admin/reviews/${id}`);
    return response.data;
  }

  async getProductReviews(productId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'recent' | 'helpful' | 'rating';
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const response = await this.api.get(`/reviews/products/${productId}?${queryParams.toString()}`);
    return response.data;
  }

  // Coupons
  async getCoupons(params?: any) {
    const response = await this.api.get('/admin/coupons', { params });
    return response.data;
  }

  async getCouponById(id: string) {
    const response = await this.api.get(`/admin/coupons/${id}`);
    return response.data;
  }

  async getCouponStats() {
    const response = await this.api.get('/admin/coupons/stats');
    return response.data;
  }

  async createCoupon(data: any) {
    const response = await this.api.post('/admin/coupons', data);
    return response.data;
  }

  async updateCoupon(id: string, data: any) {
    const response = await this.api.put(`/admin/coupons/${id}`, data);
    return response.data;
  }

  async deleteCoupon(id: string) {
    const response = await this.api.delete(`/admin/coupons/${id}`);
    return response.data;
  }

  async validateCoupon(code: string) {
    const response = await this.api.post('/admin/coupons/validate', { code });
    return response.data;
  }

  // ============= WISHLIST APIs - ✅ NEW =============
  
  /**
   * Get wishlist statistics (Admin only)
   */
  async getWishlistStats() {
    console.log('📊 Fetching wishlist stats...');
    const response = await this.api.get('/admin/wishlists/stats');
    console.log('✅ Wishlist stats:', response.data);
    return response.data;
  }

  /**
   * Get all wishlists (Admin only)
   */
  async getAllWishlists(params?: {
    page?: number;
    limit?: number;
    userId?: string;
  }) {
    console.log('📊 Fetching all wishlists...', params);
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.userId) queryParams.append('userId', params.userId);

    const response = await this.api.get(`/admin/wishlists?${queryParams.toString()}`);
    console.log('✅ Wishlists:', response.data);
    return response.data;
  }

  /**
   * Get user's wishlist (Admin only)
   */
  async getUserWishlist(userId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    console.log('📊 Fetching user wishlist:', userId);
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await this.api.get(`/admin/wishlists/user/${userId}?${queryParams.toString()}`);
    return response.data;
  }

  // Generic Methods
  async get(url: string, config?: any) {
    const response = await this.api.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.api.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.api.put(url, data, config);
    return response;
  }

  async patch(url: string, data?: any, config?: any) {
    const response = await this.api.patch(url, data, config);
    return response;
  }

  async delete(url: string, config?: any) {
    const response = await this.api.delete(url, config);
    return response;
  }
}

export default new ApiService();