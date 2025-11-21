import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.registerUser(req.body);
      return ResponseUtil.success(res, result, 'Registration successful', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'REGISTRATION_FAILED', 400);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response) {
    try {
      console.log('👤 User login attempt:', req.body.email);
      const result = await AuthService.loginUser(req.body);
      console.log('✅ User login successful');
      return ResponseUtil.success(res, result, 'Login successful');
    } catch (error: any) {
      console.error('❌ User login failed:', error.message);
      return ResponseUtil.error(res, error.message, 'LOGIN_FAILED', 401);
    }
  }

  /**
   * Login admin
   * POST /api/admin/auth/login
   */
  static async adminLogin(req: Request, res: Response) {
  try {
    console.log('👨‍💼 Admin login attempt:', req.body.email);
    const result = await AuthService.loginAdmin(req.body);
    console.log('✅ Admin login successful');
    
    if (result.token) {
      console.log('🔑 Token generated:', result.token.substring(0, 20) + '...');
    }

    // ✅ ADD: Log full response
    console.log('📦 Response being sent:', {
      success: true,
      data: {
        token: result.token ? result.token.substring(0, 20) + '...' : 'NO TOKEN',
        user: result.user,
      },
    });
    
    return ResponseUtil.success(res, result, 'Admin login successful');
  } catch (error: any) {
    console.error('❌ Admin login failed:', error.message);
    return ResponseUtil.error(res, error.message, 'LOGIN_FAILED', 401);
  }
}

  /**
   * Refresh token
   * POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return ResponseUtil.error(res, 'Refresh token is required', 'NO_TOKEN', 400);
      }

      const result = await AuthService.refreshToken(refreshToken);
      return ResponseUtil.success(res, result, 'Token refreshed');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'REFRESH_FAILED', 401);
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const user = await AuthService.getUserProfile(userId);
      return ResponseUtil.success(res, user, 'Profile retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const user = await AuthService.updateUserProfile(userId, req.body);
      return ResponseUtil.success(res, user, 'Profile updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return ResponseUtil.error(res, 'Old and new passwords are required', 'MISSING_DATA', 400);
      }

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);
      return ResponseUtil.success(res, result, 'Password changed');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CHANGE_PASSWORD_FAILED', 400);
    }
  }

  /**
   * Logout
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response) {
    // For now, just return success
    // In production, you'd invalidate the refresh token
    return ResponseUtil.success(res, null, 'Logout successful');
  }
}