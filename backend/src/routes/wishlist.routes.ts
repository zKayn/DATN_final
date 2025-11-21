// backend/src/routes/wishlist.routes.ts
// ✅ USER WISHLIST ROUTES

import { Router } from 'express';
import { WishlistController } from '../controllers/wishlist.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// ==================== ALL ROUTES REQUIRE AUTHENTICATION ====================
router.use(AuthMiddleware.authenticate);

/**
 * @route   GET /api/wishlist
 * @desc    Get user's wishlist with pagination
 * @access  Private (User)
 */
router.get('/', WishlistController.getUserWishlist);

/**
 * @route   POST /api/wishlist
 * @desc    Add product to wishlist
 * @access  Private (User)
 * @body    { productId: string }
 */
router.post('/', WishlistController.addToWishlist);

/**
 * @route   DELETE /api/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private (User)
 */
router.delete('/:productId', WishlistController.removeFromWishlist);

/**
 * @route   POST /api/wishlist/toggle
 * @desc    Toggle wishlist (add if not exists, remove if exists)
 * @access  Private (User)
 * @body    { productId: string }
 */
router.post('/toggle', WishlistController.toggleWishlist);

/**
 * @route   GET /api/wishlist/check/:productId
 * @desc    Check if product is in user's wishlist
 * @access  Private (User)
 */
router.get('/check/:productId', WishlistController.checkWishlist);

/**
 * @route   GET /api/wishlist/count
 * @desc    Get user's wishlist count
 * @access  Private (User)
 */
router.get('/count', WishlistController.getWishlistCount);

/**
 * @route   DELETE /api/wishlist
 * @desc    Clear all wishlist items
 * @access  Private (User)
 */
router.delete('/', WishlistController.clearWishlist);

export default router;