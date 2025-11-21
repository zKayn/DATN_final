// backend/src/routes/admin.routes.ts
// ✅ COMPLETE ADMIN ROUTES WITH WISHLIST

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { OrderController } from '../controllers/order.controller';
import { CustomerController } from '../controllers/customer.controller';
import { ReviewController } from '../controllers/review.controller';
import { CategoryController } from '../controllers/category.controller';
import { BrandController } from '../controllers/brand.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { CouponController } from '../controllers/coupon.controller';
import { ProductController } from '../controllers/product.controller';
import { WishlistController } from '../controllers/wishlist.controller';

const router = Router();

// ==================== PUBLIC ADMIN ROUTES ====================
// ✅ Admin auth - NO middleware needed
router.post('/auth/login', AuthController.adminLogin);

// ==================== PROTECTED ADMIN ROUTES ====================
// ✅ All routes below require admin authentication
router.use(AuthMiddleware.authenticateAdmin);

// ==================== PRODUCTS MANAGEMENT ====================
router.get('/products', ProductController.getAll);
router.get('/products/:id', ProductController.getById);
router.post('/products', ProductController.create);        // ✅ CREATE
router.put('/products/:id', ProductController.update);    // ✅ UPDATE
router.delete('/products/:id', ProductController.delete); // ✅ DELETE

// ==================== ORDERS MANAGEMENT ====================
router.get('/orders', OrderController.getAll);
router.get('/orders/stats', OrderController.getStats);
router.get('/orders/:id', OrderController.getByIdAdmin);
router.put('/orders/:id/status', OrderController.updateStatus);

// ==================== CUSTOMERS MANAGEMENT ====================
router.get('/customers', CustomerController.getAll);
router.get('/customers/stats', CustomerController.getStats);
router.get('/customers/:id', CustomerController.getById);
router.put('/customers/:id/status', CustomerController.updateStatus);

// ==================== REVIEWS MANAGEMENT ====================
// ✅ FIXED: Correct method names matching ReviewController
router.get('/reviews', ReviewController.getAllReviews);                    // List all reviews
router.get('/reviews/stats', ReviewController.getReviewStats);            // Get statistics
router.patch('/reviews/:id/status', ReviewController.updateReviewStatus); // Update status
router.delete('/reviews/:id', ReviewController.deleteReviewAdmin);        // Delete review
router.put('/reviews/:id/approve', ReviewController.approveReview);       // Approve review
router.put('/reviews/:id/reject', ReviewController.rejectReview);         // Reject review
router.put('/reviews/:id/reply', ReviewController.replyToReview);         // Reply to review

// ==================== CATEGORIES MANAGEMENT ====================
router.get('/categories', CategoryController.getAll);
router.get('/categories/:id', CategoryController.getById);
router.post('/categories', CategoryController.create);
router.put('/categories/:id', CategoryController.update);
router.delete('/categories/:id', CategoryController.delete);

// ==================== BRANDS MANAGEMENT ====================
router.get('/brands', BrandController.getAll);
router.get('/brands/:id', BrandController.getById);
router.post('/brands', BrandController.create);
router.put('/brands/:id', BrandController.update);
router.delete('/brands/:id', BrandController.delete);

// ==================== COUPONS MANAGEMENT ====================
router.get('/coupons', CouponController.getAll);
router.get('/coupons/stats', CouponController.getStats);
router.get('/coupons/:id', CouponController.getById);
router.post('/coupons', CouponController.create);
router.put('/coupons/:id', CouponController.update);
router.delete('/coupons/:id', CouponController.delete);
router.post('/coupons/validate', CouponController.validateCode);

// ==================== WISHLISTS MANAGEMENT - ✅ NEW ====================
/**
 * @route   GET /api/admin/wishlists/stats
 * @desc    Get wishlist statistics
 * @access  Private (Admin)
 */
router.get('/wishlists/stats', WishlistController.getWishlistStats);

/**
 * @route   GET /api/admin/wishlists
 * @desc    Get all wishlists with pagination
 * @access  Private (Admin)
 */
router.get('/wishlists', WishlistController.getAllWishlists);

/**
 * @route   GET /api/admin/wishlists/user/:userId
 * @desc    Get specific user's wishlist
 * @access  Private (Admin)
 */
router.get('/wishlists/user/:userId', WishlistController.getUserWishlistAdmin);

export default router;