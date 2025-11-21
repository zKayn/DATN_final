// backend/src/controllers/wishlist.controller.ts
// ✅ COMPLETE WISHLIST CONTROLLER - USER & ADMIN METHODS

import { Response } from 'express';
import { WishlistService } from '../services/wishlist.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class WishlistController {
  // ==================== USER METHODS ====================

  /**
   * Add product to wishlist
   * POST /api/wishlist
   */
  static async addToWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.body;

      console.log('❤️ Add to wishlist:', { userId, productId });

      if (!productId) {
        return ResponseUtil.badRequest(res, 'Product ID is required');
      }

      const wishlist = await WishlistService.addToWishlist(userId, productId);

      return ResponseUtil.success(
        res,
        wishlist,
        'Product added to wishlist successfully',
        201
      );
    } catch (error: any) {
      console.error('❌ Add to wishlist error:', error);
      if (error.message === 'Product not found') {
        return ResponseUtil.notFound(res, error.message);
      }
      if (error.message === 'Product already in wishlist') {
        return ResponseUtil.conflict(res, error.message);
      }
      return ResponseUtil.error(res, 'Failed to add to wishlist');
    }
  }

  /**
   * Remove product from wishlist
   * DELETE /api/wishlist/:productId
   */
  static async removeFromWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      console.log('💔 Remove from wishlist:', { userId, productId });

      const result = await WishlistService.removeFromWishlist(userId, productId);

      return ResponseUtil.success(res, result, result.message);
    } catch (error: any) {
      console.error('❌ Remove from wishlist error:', error);
      if (error.message === 'Product not in wishlist') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, 'Failed to remove from wishlist');
    }
  }

  /**
   * Get user's wishlist
   * GET /api/wishlist
   */
  static async getUserWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log('📋 Get user wishlist:', { userId, page, limit });

      const result = await WishlistService.getUserWishlist(userId, page, limit);

      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('❌ Get wishlist error:', error);
      return ResponseUtil.error(res, 'Failed to get wishlist');
    }
  }

  /**
   * Check if product is in wishlist
   * GET /api/wishlist/check/:productId
   */
  static async checkWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      console.log('🔍 Check wishlist:', { userId, productId });

      const inWishlist = await WishlistService.isInWishlist(userId, productId);

      return ResponseUtil.success(res, { inWishlist });
    } catch (error) {
      console.error('❌ Check wishlist error:', error);
      return ResponseUtil.error(res, 'Failed to check wishlist');
    }
  }

  /**
   * Get wishlist count
   * GET /api/wishlist/count
   */
  static async getWishlistCount(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      console.log('🔢 Get wishlist count:', userId);

      const count = await WishlistService.getWishlistCount(userId);

      return ResponseUtil.success(res, { count });
    } catch (error) {
      console.error('❌ Get wishlist count error:', error);
      return ResponseUtil.error(res, 'Failed to get wishlist count');
    }
  }

  /**
   * Clear wishlist
   * DELETE /api/wishlist
   */
  static async clearWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      console.log('🗑️ Clear wishlist:', userId);

      const result = await WishlistService.clearWishlist(userId);

      return ResponseUtil.success(res, result, result.message);
    } catch (error) {
      console.error('❌ Clear wishlist error:', error);
      return ResponseUtil.error(res, 'Failed to clear wishlist');
    }
  }

  /**
   * Toggle wishlist (add/remove)
   * POST /api/wishlist/toggle
   */
  static async toggleWishlist(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { productId } = req.body;

      console.log('🔄 Toggle wishlist:', { userId, productId });

      if (!productId) {
        return ResponseUtil.badRequest(res, 'Product ID is required');
      }

      const result = await WishlistService.toggleWishlist(userId, productId);

      const message =
        result.action === 'added'
          ? 'Product added to wishlist'
          : 'Product removed from wishlist';

      return ResponseUtil.success(res, result, message);
    } catch (error: any) {
      console.error('❌ Toggle wishlist error:', error);
      if (error.message === 'Product not found') {
        return ResponseUtil.notFound(res, error.message);
      }
      return ResponseUtil.error(res, 'Failed to toggle wishlist');
    }
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get wishlist statistics (Admin only)
   * GET /api/admin/wishlists/stats
   */
  static async getWishlistStats(req: AuthRequest, res: Response) {
    try {
      console.log('📊 Get wishlist stats (admin)');

      const stats = await WishlistService.getWishlistStats();

      return ResponseUtil.success(res, stats);
    } catch (error) {
      console.error('❌ Get wishlist stats error:', error);
      return ResponseUtil.error(res, 'Failed to get wishlist statistics');
    }
  }

  /**
   * Get all wishlists (Admin only)
   * GET /api/admin/wishlists
   */
  static async getAllWishlists(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log('📊 Get all wishlists (admin):', { page, limit });

      const result = await WishlistService.getAllWishlists(page, limit);

      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('❌ Get all wishlists error:', error);
      return ResponseUtil.error(res, 'Failed to get wishlists');
    }
  }

  /**
   * Get user's wishlist by admin
   * GET /api/admin/wishlists/user/:userId
   */
  static async getUserWishlistAdmin(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      console.log('📊 Get user wishlist (admin):', { userId, page, limit });

      if (!userId) {
        return ResponseUtil.badRequest(res, 'User ID is required');
      }

      const result = await WishlistService.getUserWishlist(userId, page, limit);

      return ResponseUtil.success(res, result);
    } catch (error) {
      console.error('❌ Get user wishlist (admin) error:', error);
      return ResponseUtil.error(res, 'Failed to get user wishlist');
    }
  }
}