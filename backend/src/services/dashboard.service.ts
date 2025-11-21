// backend/src/services/dashboard.service.ts

import prisma from '../config/database';

export class DashboardService {
  /**
   * Get overview statistics
   */
  static async getOverviewStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      monthRevenue,
      lastMonthRevenue,
      monthOrders,
      lastMonthOrders,
      pendingOrders,
      processingOrders,
    ] = await Promise.all([
      // ✅ FIX: Use 'total' instead of 'totalAmount'
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
      prisma.order.count(),
      // ✅ FIX: Remove 'role' filter if not in schema
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          status: 'DELIVERED',
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
        },
      }),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'PROCESSING' } }),
    ]);

    // ✅ FIX: Use 'total' and add null checks
    const revenueGrowth =
      lastMonthRevenue._sum?.total && lastMonthRevenue._sum.total > 0
        ? (((monthRevenue._sum?.total || 0) -
            (lastMonthRevenue._sum?.total || 0)) /
            (lastMonthRevenue._sum?.total || 0)) *
          100
        : 0;

    const ordersGrowth =
      lastMonthOrders > 0
        ? ((monthOrders - lastMonthOrders) / lastMonthOrders) * 100
        : 0;

    return {
      revenue: {
        total: totalRevenue._sum?.total || 0,
        thisMonth: monthRevenue._sum?.total || 0,
        lastMonth: lastMonthRevenue._sum?.total || 0,
        growth: revenueGrowth,
      },
      orders: {
        total: totalOrders,
        thisMonth: monthOrders,
        lastMonth: lastMonthOrders,
        growth: ordersGrowth,
        pending: pendingOrders,
        processing: processingOrders,
      },
      customers: {
        total: totalCustomers,
      },
      products: {
        total: totalProducts,
      },
    };
  }

  /**
   * Get revenue chart data
   */
  static async getRevenueChart(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;
    let groupBy: 'day' | 'month';

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = 'day';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        groupBy = 'month';
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = 'day';
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED',
      },
      select: {
        createdAt: true,
        total: true, // ✅ FIX: Use 'total'
      },
    });

    const chartData: { [key: string]: number } = {};

    orders.forEach((order) => {
      let key: string;
      if (groupBy === 'day') {
        key = order.createdAt.toISOString().split('T')[0];
      } else {
        key = `${order.createdAt.getFullYear()}-${String(
          order.createdAt.getMonth() + 1
        ).padStart(2, '0')}`;
      }

      chartData[key] = (chartData[key] || 0) + order.total;
    });

    const data = Object.entries(chartData)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return data;
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(limit = 10) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: {
              orderBy: { id: 'asc' },
              take: 1,
            },
            category: true,
          },
        });

        return {
          product,
          totalSold: item._sum?.quantity || 0,
          totalRevenue: (item._sum?.price || 0) * (item._sum?.quantity || 0),
        };
      })
    );

    return productsWithDetails;
  }

  /**
   * Get top customers
   */
  static async getTopCustomers(limit = 10) {
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      where: {
        status: 'DELIVERED',
      },
      _sum: {
        total: true, // ✅ FIX
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: 'desc', // ✅ FIX
        },
      },
      take: limit,
    });

    const customersWithDetails = await Promise.all(
      topCustomers.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        });

        return {
          user,
          totalSpent: item._sum?.total || 0,
          totalOrders: item._count?.id || 0,
        };
      })
    );

    return customersWithDetails;
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats() {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const revenue = await prisma.orderItem.aggregate({
          where: {
            product: {
              categoryId: category.id,
            },
            order: {
              status: 'DELIVERED',
            },
          },
          _sum: {
            price: true,
          },
        });

        return {
          id: category.id,
          name: category.name,
          productCount: category._count.products,
          revenue: revenue._sum?.price || 0,
        };
      })
    );

    return categoryStats.sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit = 10) {
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
                name: true,
                images: {
                  orderBy: { id: 'asc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return orders;
  }

  /**
   * Get sales comparison
   */
  static async getSalesComparison() {
    const now = new Date();
    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

    const [thisYearSales, lastYearSales] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfThisYear },
          status: 'DELIVERED',
        },
        _sum: { total: true }, // ✅ FIX
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startOfLastYear,
            lte: endOfLastYear,
          },
          status: 'DELIVERED',
        },
        _sum: { total: true }, // ✅ FIX
        _count: true,
      }),
    ]);

    const lastYearTotal = lastYearSales._sum?.total || 0;
    const thisYearTotal = thisYearSales._sum?.total || 0;
    const lastYearCount = lastYearSales._count || 0;
    const thisYearCount = thisYearSales._count || 0;

    return {
      thisYear: {
        revenue: thisYearTotal,
        orders: thisYearCount,
      },
      lastYear: {
        revenue: lastYearTotal,
        orders: lastYearCount,
      },
      growth: {
        revenue:
          lastYearTotal > 0
            ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
            : 0,
        orders:
          lastYearCount > 0
            ? ((thisYearCount - lastYearCount) / lastYearCount) * 100
            : 0,
      },
    };
  }
}