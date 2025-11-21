// backend/src/controllers/cart.controller.ts

import { Response } from 'express';
import prisma from '../config/database';
import { ResponseUtil } from '../utils/response';
import { AuthRequest } from '../types';

export class CartController {
  /**
   * Get user's cart
   * GET /api/cart
   */
  static async get(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              images: { 
                orderBy: { order: 'asc' }, 
                take: 1 
              },
              category: true,
              brand: true,
            },
          },
        },
      });

      const subtotal = cartItems.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
      );

      return ResponseUtil.success(
        res,
        {
          items: cartItems,
          subtotal,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        },
        'Cart retrieved'
      );
    } catch (error: any) {
      console.error('Get cart error:', error);
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Add item to cart
   * POST /api/cart/add
   */
  static async add(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { productId, quantity, size, color } = req.body;

      console.log('🛒 Adding to cart:', { userId, productId, quantity, size, color });

      // Validate product exists
      const product = await prisma.product.findUnique({ 
        where: { id: productId } 
      });

      if (!product) {
        return ResponseUtil.error(res, 'Product not found', 'NOT_FOUND', 404);
      }

      if (!product.isActive) {
        return ResponseUtil.error(res, 'Product is not available', 'NOT_AVAILABLE', 400);
      }

      if (product.stock < quantity) {
        return ResponseUtil.error(res, 'Insufficient stock', 'INSUFFICIENT_STOCK', 400);
      }

      // Check if item already exists in cart
      const existingItem = await prisma.cartItem.findFirst({
        where: { 
          userId, 
          productId, 
          size: size || null, 
          color: color || null 
        },
      });

      let cartItem;
      if (existingItem) {
        // Update quantity
        cartItem = await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity },
          include: { 
            product: { 
              include: { 
                images: { orderBy: { order: 'asc' }, take: 1 } 
              } 
            } 
          },
        });
        console.log('✅ Updated existing cart item');
      } else {
        // Create new cart item
        cartItem = await prisma.cartItem.create({
          data: { 
            userId: userId!, 
            productId, 
            quantity, 
            size, 
            color 
          },
          include: { 
            product: { 
              include: { 
                images: { orderBy: { order: 'asc' }, take: 1 } 
              } 
            } 
          },
        });
        console.log('✅ Created new cart item');
      }

      return ResponseUtil.success(res, cartItem, 'Item added to cart', 201);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      return ResponseUtil.error(res, error.message, 'ADD_FAILED', 400);
    }
  }

  /**
   * Update cart item quantity
   * PUT /api/cart/:id
   */
  static async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { id } = req.params;
      const { quantity } = req.body;

      const cartItem = await prisma.cartItem.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!cartItem || cartItem.userId !== userId) {
        return ResponseUtil.error(res, 'Cart item not found', 'NOT_FOUND', 404);
      }

      if (cartItem.product.stock < quantity) {
        return ResponseUtil.error(res, 'Insufficient stock', 'INSUFFICIENT_STOCK', 400);
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id },
        data: { quantity },
        include: { 
          product: { 
            include: { 
              images: { orderBy: { order: 'asc' }, take: 1 } 
            } 
          } 
        },
      });

      return ResponseUtil.success(res, updatedItem, 'Cart item updated');
    } catch (error: any) {
      console.error('Update cart error:', error);
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/cart/:id
   */
  static async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      const { id } = req.params;

      const cartItem = await prisma.cartItem.findUnique({ 
        where: { id } 
      });

      if (!cartItem || cartItem.userId !== userId) {
        return ResponseUtil.error(res, 'Cart item not found', 'NOT_FOUND', 404);
      }

      await prisma.cartItem.delete({ where: { id } });
      
      return ResponseUtil.success(res, null, 'Item removed from cart');
    } catch (error: any) {
      console.error('Remove cart item error:', error);
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }

  /**
   * Clear entire cart
   * DELETE /api/cart
   */
  static async clear(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 'NO_USER', 401);
      }

      await prisma.cartItem.deleteMany({ 
        where: { userId } 
      });
      
      return ResponseUtil.success(res, null, 'Cart cleared');
    } catch (error: any) {
      console.error('Clear cart error:', error);
      return ResponseUtil.error(res, error.message, 'CLEAR_FAILED', 400);
    }
  }
}