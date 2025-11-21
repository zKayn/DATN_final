// backend/src/controllers/review.controller.ts
// ✅ VERSION FOR ADMIN.ROUTES.TS (authenticateAdmin middleware already checks)

import { Response } from 'express';
import { ReviewService } from '../services/review.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class ReviewController {
  /**
   * Create a review
   * POST /api/reviews
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      console.log('📝 Creating review...');
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const review = await ReviewService.createReview(userId, req.body);
      
      console.log('✅ Review created:', review.id);
      
      return ResponseUtil.success(res, review, 'Review created successfully', 201);
    } catch (error: any) {
      console.error('❌ Create review error:', error);
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Get product reviews
   * GET /api/reviews/product/:productId
   */
  static async getProductReviews(req: AuthRequest, res: Response) {
    try {
      const { productId } = req.params;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const rating = req.query.rating ? Number(req.query.rating) : undefined;
      const sortBy = (req.query.sortBy as 'recent' | 'helpful' | 'rating') || 'recent';

      const result = await ReviewService.getProductReviews(
        productId,
        page,
        limit,
        rating,
        sortBy
      );

      return ResponseUtil.success(res, result, 'Reviews retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get user's reviews
   * GET /api/reviews/user/me
   */
  static async getMyReviews(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const result = await ReviewService.getUserReviews(userId, page, limit);
      return ResponseUtil.success(res, result, 'Reviews retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Update review
   * PATCH /api/reviews/:id
   */
  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { id } = req.params;
      const review = await ReviewService.updateReview(id, userId, req.body);
      return ResponseUtil.success(res, review, 'Review updated successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete review
   * DELETE /api/reviews/:id
   */
  static async delete(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { id } = req.params;
      const result = await ReviewService.deleteReview(id, userId);
      return ResponseUtil.success(res, result, 'Review deleted successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }

  /**
   * Mark review as helpful
   * POST /api/reviews/:id/helpful
   */
  static async markHelpful(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { id } = req.params;
      const result = await ReviewService.markReviewHelpful(id, userId);
      return ResponseUtil.success(res, result, 'Vote recorded successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'VOTE_FAILED', 400);
    }
  }

  /**
   * Check if user can review product
   * GET /api/reviews/can-review/:productId
   */
  static async canReview(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { productId } = req.params;
      const result = await ReviewService.canUserReviewProduct(userId, productId);
      return ResponseUtil.success(res, result, 'Check completed');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CHECK_FAILED', 400);
    }
  }

  // ==================== ADMIN ENDPOINTS ====================
  // ✅ NO admin role check needed - authenticateAdmin middleware handles it

  /**
   * Get all reviews (Admin)
   * GET /api/admin/reviews
   */
  static async getAllReviews(req: AuthRequest, res: Response) {
    try {
      console.log('📊 Admin getting all reviews...');
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status as 'pending' | 'approved' | 'all';
      const rating = req.query.rating ? Number(req.query.rating) : undefined;

      const result = await ReviewService.getAllReviews(page, limit, status, rating);
      
      // Handle both array response and object with reviews property
      const reviewCount = Array.isArray(result) 
        ? result.length 
        : (result as any).reviews?.length || 0;
      console.log('✅ Found', reviewCount, 'reviews');
      
      return ResponseUtil.success(res, result, 'Reviews retrieved successfully');
    } catch (error: any) {
      console.error('❌ Get all reviews error:', error);
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get review statistics (Admin)
   * GET /api/admin/reviews/stats
   */
  static async getReviewStats(req: AuthRequest, res: Response) {
    try {
      console.log('📊 Admin getting review stats...');
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);

      const stats = await ReviewService.getReviewStats();

      console.log('✅ Stats calculated:', stats);
      return ResponseUtil.success(res, stats);
    } catch (error: any) {
      console.error('❌ Get review stats error:', error);
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Update review status (Admin)
   * PATCH /api/admin/reviews/:id/status
   */
  static async updateReviewStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      console.log(`✏️ Admin updating review ${id} status to ${status}...`);
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);

      if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
        return ResponseUtil.error(res, 'Invalid status', 'VALIDATION_ERROR', 400);
      }

      const review = await ReviewService.updateReviewStatus(id, status);

      console.log('✅ Review status updated');
      return ResponseUtil.success(res, review, 'Review status updated successfully');
    } catch (error: any) {
      console.error('❌ Update review status error:', error);
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete any review (Admin)
   * DELETE /api/admin/reviews/:id
   */
  static async deleteReviewAdmin(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      console.log(`🗑️ Admin deleting review ${id}...`);
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);

      await ReviewService.deleteReviewAdmin(id);

      console.log('✅ Review deleted by admin');
      return ResponseUtil.success(res, null, 'Review deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete review (admin) error:', error);
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }

  /**
   * Approve review (Admin)
   * PUT /api/admin/reviews/:id/approve
   */
  static async approveReview(req: AuthRequest, res: Response) {
    try {
      console.log(`✅ Admin approving review ${req.params.id}...`);
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);
      
      const { id } = req.params;
      const review = await ReviewService.approveReview(id);
      
      console.log('✅ Review approved');
      return ResponseUtil.success(res, review, 'Review approved successfully');
    } catch (error: any) {
      console.error('❌ Approve review error:', error);
      return ResponseUtil.error(res, error.message, 'APPROVE_FAILED', 400);
    }
  }

  /**
   * Reject review (Admin)
   * PUT /api/admin/reviews/:id/reject
   */
  static async rejectReview(req: AuthRequest, res: Response) {
    try {
      console.log(`❌ Admin rejecting review ${req.params.id}...`);
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);
      
      const { id } = req.params;
      const review = await ReviewService.rejectReview(id);
      
      console.log('✅ Review rejected');
      return ResponseUtil.success(res, review, 'Review rejected successfully');
    } catch (error: any) {
      console.error('❌ Reject review error:', error);
      return ResponseUtil.error(res, error.message, 'REJECT_FAILED', 400);
    }
  }

  /**
   * Reply to review (Admin)
   * PUT /api/admin/reviews/:id/reply
   */
  static async replyToReview(req: AuthRequest, res: Response) {
    try {
      console.log(`💬 Admin replying to review ${req.params.id}...`);
      console.log('Admin user:', req.user?.email, 'Role:', req.user?.role);
      
      const { id } = req.params;
      const { reply } = req.body;

      if (!reply) {
        return ResponseUtil.error(res, 'Reply text is required', 'VALIDATION_ERROR', 400);
      }

      const review = await ReviewService.replyToReview(id, reply);
      
      console.log('✅ Reply added');
      return ResponseUtil.success(res, review, 'Reply added successfully');
    } catch (error: any) {
      console.error('❌ Reply to review error:', error);
      return ResponseUtil.error(res, error.message, 'REPLY_FAILED', 400);
    }
  }
}