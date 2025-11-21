// backend/src/controllers/brand.controller.ts

import { Request, Response } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';

export class BrandController {
  /**
   * Get all brands
   */
  static async getAll(req: Request, res: Response) {
    try {
      const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
      });

      return ResponseUtil.success(res, brands, 'Brands retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get brand by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const brand = await prisma.brand.findUnique({
        where: { id },
        include: {
          products: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!brand) {
        return ResponseUtil.error(res, 'Brand not found', 'NOT_FOUND', 404);
      }

      return ResponseUtil.success(res, brand, 'Brand retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Create brand
   */
  static async create(req: Request, res: Response) {
    try {
      const { name, slug, logo, description, isActive } = req.body;

      // Check if slug already exists
      const existing = await prisma.brand.findUnique({
        where: { slug },
      });

      if (existing) {
        return ResponseUtil.error(res, 'Slug already exists', 'DUPLICATE_SLUG', 400);
      }

      const brand = await prisma.brand.create({
        data: {
          name,
          slug,
          logo,
          description,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      return ResponseUtil.success(res, brand, 'Brand created', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Update brand
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, logo, description, isActive } = req.body;

      // Check if brand exists
      const existing = await prisma.brand.findUnique({
        where: { id },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Brand not found', 'NOT_FOUND', 404);
      }

      // Check if slug is being changed and already exists
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.brand.findUnique({
          where: { slug },
        });

        if (slugExists) {
          return ResponseUtil.error(res, 'Slug already exists', 'DUPLICATE_SLUG', 400);
        }
      }

      const brand = await prisma.brand.update({
        where: { id },
        data: {
          name,
          slug,
          logo,
          description,
          isActive,
        },
      });

      return ResponseUtil.success(res, brand, 'Brand updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete brand
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if brand exists
      const existing = await prisma.brand.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Brand not found', 'NOT_FOUND', 404);
      }

      // Check if brand has products
      if (existing.products.length > 0) {
        return ResponseUtil.error(
          res,
          'Cannot delete brand with products',
          'HAS_PRODUCTS',
          400
        );
      }

      await prisma.brand.delete({
        where: { id },
      });

      return ResponseUtil.success(res, null, 'Brand deleted');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }
}