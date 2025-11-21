// backend/src/routes/review.routes.ts
// ✅ VERSION WITHOUT requireAdmin middleware
// Admin check will be done in controller

import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ==================== PUBLIC ROUTES ====================
// Get reviews for a product (singular)
router.get('/product/:productId', ReviewController.getProductReviews);

// Get reviews for a product (plural - for mobile app)
router.get('/products/:productId', ReviewController.getProductReviews);

// ==================== USER ROUTES (Authenticated) ====================
// Create a review
router.post('/', AuthMiddleware.authenticate, ReviewController.create);

// Update user's own review
router.patch('/:id', AuthMiddleware.authenticate, ReviewController.update);

// Delete user's own review
router.delete('/:id', AuthMiddleware.authenticate, ReviewController.delete);

// Get user's reviews
router.get('/user/me', AuthMiddleware.authenticate, ReviewController.getMyReviews);

// Get user's reviews (alias for mobile app)
router.get('/my-reviews', AuthMiddleware.authenticate, ReviewController.getMyReviews);

// Mark review as helpful
router.post('/:id/helpful', AuthMiddleware.authenticate, ReviewController.markHelpful);

// Check if user can review product
router.get('/can-review/:productId', AuthMiddleware.authenticate, ReviewController.canReview);

// Check if user can review product (alias for mobile app)
router.get('/products/:productId/can-review', AuthMiddleware.authenticate, ReviewController.canReview);

// ==================== ADMIN ROUTES ====================
// ✅ Only authenticate, admin check done in controller
// Admin routes must come BEFORE parameterized routes

// Get all reviews (Admin)
router.get('/admin/all', AuthMiddleware.authenticate, ReviewController.getAllReviews);

// Get review statistics (Admin)
router.get('/admin/stats', AuthMiddleware.authenticate, ReviewController.getReviewStats);

// Update review status (Admin)
router.patch('/admin/:id/status', AuthMiddleware.authenticate, ReviewController.updateReviewStatus);

// Delete any review (Admin)
router.delete('/admin/:id', AuthMiddleware.authenticate, ReviewController.deleteReviewAdmin);

// Approve review (Admin)
router.put('/admin/:id/approve', AuthMiddleware.authenticate, ReviewController.approveReview);

// Reject review (Admin)
router.put('/admin/:id/reject', AuthMiddleware.authenticate, ReviewController.rejectReview);

// Reply to review (Admin)
router.put('/admin/:id/reply', AuthMiddleware.authenticate, ReviewController.replyToReview);

export default router;