// backend/src/controllers/order.controller.ts

import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';
import socketService from '../services/socket.service';

export class OrderController {
  /**
   * Create new order
   * POST /api/orders
   * 🔔 UPDATED: Now emits socket event to admins
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const order = await OrderService.createOrder(userId, req.body);

      // 🔔 Notify all admins about new order
      socketService.notifyAdmins('order:created', {
        order,
        message: `New order #${order.orderNumber} created`,
        timestamp: new Date(),
      });

      console.log('🔔 New order notification sent to admins');

      return ResponseUtil.success(res, order, 'Order created successfully', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Get user's orders
   * GET /api/orders
   */
  static async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const { orders, meta } = await OrderService.getUserOrders(userId, page, limit);
      
      // 💰 Calculate total from items if missing or zero
      const ordersWithTotal = orders.map(order => {
        const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
          return sum + (Number(item.price || 0) * Number(item.quantity || 0));
        }, 0) || 0;

        const total = order.total > 0 ? order.total : calculatedTotal;

        return {
          ...order,
          total,
          subtotal: total,
        };
      });
      
      return ResponseUtil.paginated(res, ordersWithTotal, meta, 'Orders retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  static async getById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const order = await OrderService.getOrderById(req.params.id, userId);
      
      // 💰 Calculate total from items if missing or zero
      const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
        return sum + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0) || 0;

      const total = order.total > 0 ? order.total : calculatedTotal;

      const orderWithTotal = {
        ...order,
        total,
        subtotal: total,
      };
      
      return ResponseUtil.success(res, orderWithTotal, 'Order retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 404);
    }
  }

  /**
   * Get order by order number
   * GET /api/orders/number/:orderNumber
   */
  static async getByNumber(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const order = await OrderService.getOrderByNumber(req.params.orderNumber, userId);
      
      // 💰 Calculate total from items if missing or zero
      const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
        return sum + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0) || 0;

      const total = order.total > 0 ? order.total : calculatedTotal;

      const orderWithTotal = {
        ...order,
        total,
        subtotal: total,
      };
      
      return ResponseUtil.success(res, orderWithTotal, 'Order retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 404);
    }
  }

  /**
   * Cancel order
   * PUT /api/orders/:id/cancel
   * 🔔 UPDATED: Now emits socket event to admins
   */
  static async cancel(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { reason } = req.body;
      const order = await OrderService.cancelOrder(req.params.id, userId, reason);

      // 🔔 Notify all admins about cancelled order
      socketService.notifyAdmins('order:cancelled', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reason,
        userId,
        message: `Order #${order.orderNumber} was cancelled`,
        timestamp: new Date(),
      });

      console.log('🔔 Order cancellation notification sent to admins');

      return ResponseUtil.success(res, order, 'Order cancelled successfully');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CANCEL_FAILED', 400);
    }
  }

  /**
   * Get all orders (Admin only)
   * GET /api/admin/orders
   */
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const status = req.query.status as string;
      const paymentStatus = req.query.paymentStatus as string;
      const search = req.query.search as string;

      const { orders, meta } = await OrderService.getAllOrders(
        page,
        limit,
        status,
        paymentStatus,
        search
      );

      // 💰 Calculate total from items if missing or zero
      const ordersWithTotal = orders.map(order => {
        const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
          return sum + (Number(item.price || 0) * Number(item.quantity || 0));
        }, 0) || 0;

        const total = order.total > 0 ? order.total : calculatedTotal;
        const subtotal = order.subtotal > 0 ? order.subtotal : calculatedTotal;

        console.log(`💰 Order ${order.orderNumber}: DB total=${order.total}, Calculated=${calculatedTotal}, Final=${total}`);

        return {
          ...order,
          total,
          subtotal,
          totalAmount: total, // Also set totalAmount for frontend compatibility
        };
      });

      return ResponseUtil.paginated(res, ordersWithTotal, meta, 'Orders retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get order by ID (Admin)
   * GET /api/admin/orders/:id
   */
  static async getByIdAdmin(req: AuthRequest, res: Response) {
    try {
      const order = await OrderService.getOrderById(req.params.id);
      
      // 💰 Calculate total from items if missing or zero
      const calculatedTotal = order.items?.reduce((sum: number, item: any) => {
        return sum + (Number(item.price || 0) * Number(item.quantity || 0));
      }, 0) || 0;

      const total = order.total > 0 ? order.total : calculatedTotal;

      const orderWithTotal = {
        ...order,
        total,
        subtotal: total,
      };
      
      return ResponseUtil.success(res, orderWithTotal, 'Order retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 404);
    }
  }

  /**
   * Update order status (Admin only)
   * PUT /api/admin/orders/:id/status
   * 🔔 UPDATED: Now emits socket event to user and admins
   */
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const order = await OrderService.updateOrderStatus(req.params.id, req.body);

      // 🔔 Notify the specific user about their order status change
      socketService.notifyUser(order.userId, 'order:updated', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        message: `Your order #${order.orderNumber} status changed to ${order.status}`,
        timestamp: new Date(),
      });

      // 🔔 Also notify all admins about the status change
      socketService.notifyAdmins('order:status_changed', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        updatedBy: req.user?.userId,
        timestamp: new Date(),
      });

      console.log(`🔔 Order status update sent to user ${order.userId} and admins`);

      return ResponseUtil.success(res, order, 'Order status updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Get order statistics (Admin only)
   * GET /api/admin/orders/stats
   */
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await OrderService.getOrderStats();
      return ResponseUtil.success(res, stats, 'Statistics retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }
}