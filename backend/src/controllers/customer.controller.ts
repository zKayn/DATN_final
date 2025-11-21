import { Request, Response } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class CustomerController {
  /**
   * Get all customers (Admin only)
   * GET /api/admin/customers
   */
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const search = req.query.search as string;
      const status = req.query.status as string;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search } },
          { firstName: { contains: search } },
          { lastName: { contains: search } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const total = await prisma.user.count({ where });

      const customers = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatar: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              orders: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const meta = ResponseUtil.generatePaginationMeta(total, page, limit);

      return ResponseUtil.paginated(res, customers, meta, 'Customers retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get customer by ID (Admin only)
   * GET /api/admin/customers/:id
   */
  static async getById(req: AuthRequest, res: Response) {
    try {
      const customer = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          orders: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          addresses: true,
          reviews: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!customer) {
        return ResponseUtil.error(res, 'Customer not found', 'NOT_FOUND', 404);
      }

      return ResponseUtil.success(res, customer, 'Customer retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Update customer status (Admin only)
   * PUT /api/admin/customers/:id/status
   */
  static async updateStatus(req: AuthRequest, res: Response) {
    try {
      const { status } = req.body;

      const customer = await prisma.user.update({
        where: { id: req.params.id },
        data: { status },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });

      return ResponseUtil.success(res, customer, 'Customer status updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Get customer statistics (Admin only)
   * GET /api/admin/customers/stats
   */
  static async getStats(req: AuthRequest, res: Response) {
    try {
      const [totalCustomers, activeCustomers, blockedCustomers, newCustomers] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { status: 'ACTIVE' } }),
          prisma.user.count({ where: { status: 'BLOCKED' } }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          }),
        ]);

      return ResponseUtil.success(
        res,
        {
          totalCustomers,
          activeCustomers,
          blockedCustomers,
          newCustomers,
        },
        'Statistics retrieved'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }
}