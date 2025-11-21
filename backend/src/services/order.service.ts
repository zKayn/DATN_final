import prisma from '../config/database';
import { CreateOrderDTO, UpdateOrderStatusDTO } from '../types';
import { SlugUtil } from '../utils/slug';
import { ResponseUtil } from '../utils/response';

export class OrderService {
  /**
   * Create new order
   */
  static async createOrder(userId: string, data: CreateOrderDTO) {
    // Validate products and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is not available`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: product.price,
      });
    }

    // Calculate shipping fee
    const shippingFee = data.shippingMethod === 'express' ? 15 : 5;

    // Calculate total
    const total = subtotal + shippingFee;

    // Generate order number
    const orderNumber = SlugUtil.generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        subtotal,
        shippingFee,
        total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: data.paymentMethod,
        shippingMethod: data.shippingMethod,
        shippingAddress: data.shippingAddress as any,
        notes: data.notes,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Update product stock and sold count
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return order;
  }

  /**
   * Get user orders
   */
  static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const total = await prisma.order.count({
      where: { userId },
    });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = ResponseUtil.generatePaginationMeta(total, page, limit);

    return { orders, meta };
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // If userId provided, check ownership
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to view this order');
    }

    return order;
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(orderNumber: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // If userId provided, check ownership
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized to view this order');
    }

    return order;
  }

  /**
   * Update order status
   * 🔥 UPDATED: Can be called from both Admin Web and Mobile App
   */
  static async updateOrderStatus(orderId: string, data: UpdateOrderStatusDTO) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: data.status as any,
        trackingNumber: data.trackingNumber,
        notes: data.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Cancel order
   */
  static async cancelOrder(orderId: string, userId: string, reason?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
      throw new Error('Order cannot be cancelled at this stage');
    }

    // Restore product stock
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          soldCount: { decrement: item.quantity },
        },
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        cancelReason: reason,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Get all orders (Admin only)
   */
  static async getAllOrders(
    page: number = 1,
    limit: number = 20,
    status?: string,
    paymentStatus?: string,
    search?: string
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const total = await prisma.order.count({ where });

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  orderBy: { order: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = ResponseUtil.generatePaginationMeta(total, page, limit);

    return { orders, meta };
  }

  /**
   * Get order statistics (Admin only)
   * 🔥 UPDATED: Added completedOrders field for Dashboard
   */
  static async getOrderStats() {
    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueData,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({
        where: { 
          paymentStatus: 'PAID',
          status: { not: 'CANCELLED' }
        },
        _sum: { total: true },
      }),
    ]);

    // completedOrders = DELIVERED
    const completedOrders = deliveredOrders;

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      completedOrders, // For Dashboard
      cancelledOrders,
      totalRevenue: revenueData._sum.total || 0,
    };
  }

  /**
   * 🔥 NEW: Get recent orders for Dashboard
   */
  static async getRecentOrders(limit: number = 10) {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return orders;
  }

  /**
   * 🔥 NEW: Get top selling products
   */
  static async getTopProducts(limit: number = 10) {
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { soldCount: 'desc' },
      include: {
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        brand: true,
        category: true,
      },
    });

    return products;
  }
}