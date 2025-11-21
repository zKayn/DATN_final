// backend/src/routes/dashboard.routes.ts

import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes require admin authentication
router.use(AuthMiddleware.authenticateAdmin);

/**
 * @route   GET /api/admin/dashboard/overview
 * @desc    Get overview statistics
 * @access  Private (Admin)
 */
router.get('/overview', DashboardController.getOverview);

/**
 * @route   GET /api/admin/dashboard/revenue
 * @desc    Get revenue chart data
 * @access  Private (Admin)
 * @query   period: week | month | year
 */
router.get('/revenue', DashboardController.getRevenueChart);

/**
 * @route   GET /api/admin/dashboard/top-products
 * @desc    Get top selling products
 * @access  Private (Admin)
 * @query   limit: number
 */
router.get('/top-products', DashboardController.getTopProducts);

/**
 * @route   GET /api/admin/dashboard/top-customers
 * @desc    Get top customers
 * @access  Private (Admin)
 * @query   limit: number
 */
router.get('/top-customers', DashboardController.getTopCustomers);

/**
 * @route   GET /api/admin/dashboard/categories
 * @desc    Get category statistics
 * @access  Private (Admin)
 */
router.get('/categories', DashboardController.getCategoryStats);

/**
 * @route   GET /api/admin/dashboard/recent-orders
 * @desc    Get recent orders
 * @access  Private (Admin)
 * @query   limit: number
 */
router.get('/recent-orders', DashboardController.getRecentOrders);

/**
 * @route   GET /api/admin/dashboard/sales-comparison
 * @desc    Get sales comparison (this year vs last year)
 * @access  Private (Admin)
 */
router.get('/sales-comparison', DashboardController.getSalesComparison);

export default router;