// backend/src/services/dashboard.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Get overview statistics
   */
  static async getOverviewStats() {
    console.log('📊 DashboardService: Getting overview stats...');

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      processingOrders,
    ] = await Promise.all([
      // Total revenue from completed orders
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
      // Total orders
      prisma.order.count(),
      // Total customers
      prisma.user.count(),
      // Total products
      prisma.product.count(),
      // Pending orders
      prisma.order.count({ where: { status: 'PENDING' } }),
      // Processing orders
      prisma.order.count({ where: { status: 'PROCESSING' } }),
    ]);

    console.log('✅ Overview stats calculated');

    return {
      revenue: {
        total: totalRevenue._sum.total || 0,
        change: 0,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
      },
      customers: {
        total: totalCustomers,
        change: 0,
      },
      products: {
        total: totalProducts,
      },
    };
  }

  /**
   * Get revenue chart data
   */
  static async getRevenueChart(period: 'week' | 'month' | 'year') {
    console.log('📈 DashboardService: Getting revenue chart for', period);

    const now = new Date();
    let startDate: Date;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: startDate },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const revenueByDate = new Map<string, number>();
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      revenueByDate.set(date, (revenueByDate.get(date) || 0) + order.total);
    });

    const data = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue,
    }));

    console.log('✅ Revenue chart data:', data.length, 'points');
    return data;
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(limit: number = 10) {
    console.log('🏆 DashboardService: Getting top', limit, 'products');

    const products = await prisma.product.findMany({
      orderBy: { soldCount: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        soldCount: true,
        stock: true,
        images: {
          select: { url: true },
          take: 1,
        },
      },
    });

    console.log('✅ Top products:', products.length);
    return products;
  }

  /**
   * Get top customers
   */
  static async getTopCustomers(limit: number = 10) {
    console.log('👥 DashboardService: Getting top', limit, 'customers');

    const customers = await prisma.user.findMany({
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        _count: {
          select: { orders: true },
        },
        orders: {
          where: { status: 'DELIVERED' },
          select: { total: true },
        },
      },
    });

    const result = customers.map(customer => ({
      id: customer.id,
      email: customer.email,
      name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
      orderCount: customer._count.orders,
      totalSpent: customer.orders.reduce((sum, order) => sum + order.total, 0),
    }));

    console.log('✅ Top customers:', result.length);
    return result;
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats() {
    console.log('📂 DashboardService: Getting category stats');

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
      },
    });

    console.log('✅ Category stats:', categories.length);
    return categories;
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit: number = 10) {
    console.log('📦 DashboardService: Getting recent', limit, 'orders');

    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('✅ Recent orders:', orders.length);
    return orders;
  }

  /**
   * Get sales comparison (this year vs last year)
   */
  static async getSalesComparison() {
    console.log('📊 DashboardService: Getting sales comparison');

    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);

    const [thisYear, lastYear] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: thisYearStart },
        },
        _sum: { total: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: lastYearStart,
            lte: lastYearEnd,
          },
        },
        _sum: { total: true },
        _count: true,
      }),
    ]);

    const result = {
      thisYear: {
        revenue: thisYear._sum.total || 0,
        orders: thisYear._count,
      },
      lastYear: {
        revenue: lastYear._sum.total || 0,
        orders: lastYear._count,
      },
      change: {
        revenue: lastYear._sum.total
          ? ((thisYear._sum.total || 0) - (lastYear._sum.total || 0)) / (lastYear._sum.total || 1) * 100
          : 0,
        orders: lastYear._count
          ? ((thisYear._count - lastYear._count) / lastYear._count) * 100
          : 0,
      },
    };

    console.log('✅ Sales comparison calculated');
    return result;
  }
}