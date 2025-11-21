// backend/src/controllers/category.controller.ts

import { Request, Response } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';

export class CategoryController {
  /**
   * Get all categories
   */
  static async getAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { order: 'asc' },
      });

      return ResponseUtil.success(res, categories, 'Categories retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get category by ID
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          products: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!category) {
        return ResponseUtil.error(res, 'Category not found', 'NOT_FOUND', 404);
      }

      return ResponseUtil.success(res, category, 'Category retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Create category
   */
  static async create(req: Request, res: Response) {
    try {
      const { name, slug, icon, description, isActive, order } = req.body;

      // Check if slug already exists
      const existing = await prisma.category.findUnique({
        where: { slug },
      });

      if (existing) {
        return ResponseUtil.error(res, 'Slug already exists', 'DUPLICATE_SLUG', 400);
      }

      const category = await prisma.category.create({
        data: {
          name,
          slug,
          icon,
          description,
          isActive: isActive !== undefined ? isActive : true,
          order: order || 0,
        },
      });

      return ResponseUtil.success(res, category, 'Category created', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Update category
   */
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, slug, icon, description, isActive, order } = req.body;

      // Check if category exists
      const existing = await prisma.category.findUnique({
        where: { id },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Category not found', 'NOT_FOUND', 404);
      }

      // Check if slug is being changed and already exists
      if (slug && slug !== existing.slug) {
        const slugExists = await prisma.category.findUnique({
          where: { slug },
        });

        if (slugExists) {
          return ResponseUtil.error(res, 'Slug already exists', 'DUPLICATE_SLUG', 400);
        }
      }

      const category = await prisma.category.update({
        where: { id },
        data: {
          name,
          slug,
          icon,
          description,
          isActive,
          order,
        },
      });

      return ResponseUtil.success(res, category, 'Category updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete category
   */
  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // Check if category exists
      const existing = await prisma.category.findUnique({
        where: { id },
        include: {
          products: true,
        },
      });

      if (!existing) {
        return ResponseUtil.error(res, 'Category not found', 'NOT_FOUND', 404);
      }

      // Check if category has products
      if (existing.products.length > 0) {
        return ResponseUtil.error(
          res,
          'Cannot delete category with products',
          'HAS_PRODUCTS',
          400
        );
      }

      await prisma.category.delete({
        where: { id },
      });

      return ResponseUtil.success(res, null, 'Category deleted');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }
}