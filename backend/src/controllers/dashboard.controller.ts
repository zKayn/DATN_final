// backend/src/controllers/dashboard.controller.ts

import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class DashboardController {
  /**
   * Get overview statistics
   * GET /api/admin/dashboard/overview
   */
  static async getOverview(req: AuthRequest, res: Response) {
    try {
      console.log('📊 Get dashboard overview');
      const stats = await DashboardService.getOverviewStats();
      return ResponseUtil.success(res, stats);
    } catch (error) {
      console.error('❌ Get overview error:', error);
      return ResponseUtil.error(res, 'Failed to get overview statistics');
    }
  }

  /**
   * Get revenue chart data
   * GET /api/admin/dashboard/revenue?period=month
   */
  static async getRevenueChart(req: AuthRequest, res: Response) {
    try {
      const period = (req.query.period as 'week' | 'month' | 'year') || 'month';
      console.log('📈 Get revenue chart:', period);

      const data = await DashboardService.getRevenueChart(period);
      return ResponseUtil.success(res, data);
    } catch (error) {
      console.error('❌ Get revenue chart error:', error);
      return ResponseUtil.error(res, 'Failed to get revenue chart');
    }
  }

  /**
   * Get top selling products
   * GET /api/admin/dashboard/top-products?limit=10
   */
  static async getTopProducts(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      console.log('🏆 Get top products:', limit);

      const products = await DashboardService.getTopProducts(limit);
      return ResponseUtil.success(res, products);
    } catch (error) {
      console.error('❌ Get top products error:', error);
      return ResponseUtil.error(res, 'Failed to get top products');
    }
  }

  /**
   * Get top customers
   * GET /api/admin/dashboard/top-customers?limit=10
   */
  static async getTopCustomers(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      console.log('👥 Get top customers:', limit);

      const customers = await DashboardService.getTopCustomers(limit);
      return ResponseUtil.success(res, customers);
    } catch (error) {
      console.error('❌ Get top customers error:', error);
      return ResponseUtil.error(res, 'Failed to get top customers');
    }
  }

  /**
   * Get category statistics
   * GET /api/admin/dashboard/categories
   */
  static async getCategoryStats(req: AuthRequest, res: Response) {
    try {
      console.log('📂 Get category stats');
      const stats = await DashboardService.getCategoryStats();
      return ResponseUtil.success(res, stats);
    } catch (error) {
      console.error('❌ Get category stats error:', error);
      return ResponseUtil.error(res, 'Failed to get category statistics');
    }
  }

  /**
   * Get recent orders
   * GET /api/admin/dashboard/recent-orders?limit=10
   */
  static async getRecentOrders(req: AuthRequest, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      console.log('📦 Get recent orders:', limit);

      const orders = await DashboardService.getRecentOrders(limit);
      return ResponseUtil.success(res, orders);
    } catch (error) {
      console.error('❌ Get recent orders error:', error);
      return ResponseUtil.error(res, 'Failed to get recent orders');
    }
  }

  /**
   * Get sales comparison
   * GET /api/admin/dashboard/sales-comparison
   */
  static async getSalesComparison(req: AuthRequest, res: Response) {
    try {
      console.log('📊 Get sales comparison');
      const comparison = await DashboardService.getSalesComparison();
      return ResponseUtil.success(res, comparison);
    } catch (error) {
      console.error('❌ Get sales comparison error:', error);
      return ResponseUtil.error(res, 'Failed to get sales comparison');
    }
  }
}