// backend/src/controllers/coupon.controller.ts

import { Request, Response } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';

export class CouponController {
  /**
   * Get all coupons
   */
  static async getAll(req: Request, res: Response) {
    try {
      const coupons = await prisma.coupon.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return ResponseUtil.success(res, coupons, 'Coupons retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get coupon by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const coupon = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!coupon) {
        return ResponseUtil.error(res, 'Coupon not found', 'NOT_FOUND', 404);
      }

      return ResponseUtil.success(res, coupon, 'Coupon retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Validate coupon code
   */
  static async validateCode(req: Request, res: Response) {
    try {
      const { code, orderAmount } = req.body;

      const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!coupon) {
        return ResponseUtil.error(res, 'Invalid coupon code', 'INVALID_CODE', 400);
      }

      if (!coupon.isActive) {
        return ResponseUtil.error(res, 'Coupon is inactive', 'INACTIVE', 400);
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return ResponseUtil.error(res, 'Coupon is expired or not yet active', 'EXPIRED', 400);
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return ResponseUtil.error(res, 'Coupon usage limit reached', 'LIMIT_REACHED', 400);
      }

      if (coupon.minPurchase && orderAmount < coupon.minPurchase) {
        return ResponseUtil.error(
          res,
          `Minimum purchase amount is $${coupon.minPurchase}`,
          'MIN_PURCHASE',
          400
        );
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.discountValue;
      }

      return ResponseUtil.success(
        res,
        {
          coupon,
          discount,
          finalAmount: orderAmount - discount,
        },
        'Coupon is valid'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'VALIDATION_FAILED', 400);
    }
  }

  /**
   * Create coupon
   */
  static async create(req: Request, res: Response) {
    try {
      const {
        code,
        description,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        isActive,
      } = req.body;

      // Check if code already exists
      const existing = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (existing) {
        return ResponseUtil.error(res, 'Coupon code already exists', 'DUPLICATE_CODE', 400);
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: code.toUpperCase(),
          description,
          discountType,
          discountValue: parseFloat(discountValue),
          minPurchase: minPurchase ? parseFloat(minPurchase) : null,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      return ResponseUtil.success(res, coupon, 'Coupon created', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Update coupon
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        code,
        description,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        usageLimit,
        startDate,
        endDate,
        isActive,
      } = req.body;

      // Check if coupon exists
      const existing = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Coupon not found', 'NOT_FOUND', 404);
      }

      // Check if code is being changed and already exists
      if (code && code.toUpperCase() !== existing.code) {
        const codeExists = await prisma.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });

        if (codeExists) {
          return ResponseUtil.error(res, 'Coupon code already exists', 'DUPLICATE_CODE', 400);
        }
      }

      const coupon = await prisma.coupon.update({
        where: { id },
        data: {
          code: code ? code.toUpperCase() : undefined,
          description,
          discountType,
          discountValue: discountValue ? parseFloat(discountValue) : undefined,
          minPurchase: minPurchase ? parseFloat(minPurchase) : null,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          isActive,
        },
      });

      return ResponseUtil.success(res, coupon, 'Coupon updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete coupon
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const existing = await prisma.coupon.findUnique({
        where: { id },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Coupon not found', 'NOT_FOUND', 404);
      }

      await prisma.coupon.delete({
        where: { id },
      });

      return ResponseUtil.success(res, null, 'Coupon deleted');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }

  /**
   * Get coupon statistics
   */
  static async getStats(req: Request, res: Response) {
    try {
      const totalCoupons = await prisma.coupon.count();
      const activeCoupons = await prisma.coupon.count({
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });
      const expiredCoupons = await prisma.coupon.count({
        where: { endDate: { lt: new Date() } },
      });

      const totalUsage = await prisma.coupon.aggregate({
        _sum: { usedCount: true },
      });

      return ResponseUtil.success(
        res,
        {
          totalCoupons,
          activeCoupons,
          expiredCoupons,
          totalUsage: totalUsage._sum.usedCount || 0,
        },
        'Coupon statistics retrieved'
      );
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }
}