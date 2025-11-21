// backend/src/controllers/product.controller.ts
// ✅ COMPLETE - With image validation & hard delete cascade

import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { ResponseUtil } from '../utils/response';

export class ProductController {
  /**
   * Create product (Admin only)
   * POST /api/admin/products
   */
  static async create(req: Request, res: Response) {
    try {
      const { images } = req.body;

      // ✅ Validate image sizes
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          
          // Skip if not base64 (could be URL)
          if (!img.includes('base64,')) {
            continue;
          }
          
          const base64Data = img.split('base64,')[1];
          const sizeInMB = (Buffer.from(base64Data, 'base64').length) / (1024 * 1024);
          
          if (sizeInMB > 5) {
            return ResponseUtil.error(
              res, 
              `Image ${i + 1} is too large (${sizeInMB.toFixed(2)}MB). Maximum size is 5MB per image.`,
              'IMAGE_TOO_LARGE',
              400
            );
          }
        }
      }

      const product = await ProductService.createProduct(req.body);
      return ResponseUtil.success(res, product, 'Product created', 201);
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'CREATE_FAILED', 400);
    }
  }

  /**
   * Get all products
   * GET /api/products
   */
  static async getAll(req: Request, res: Response) {
    try {
      const filters = {
        search: req.query.search as string,
        categoryId: req.query.categoryId as string,
        brandId: req.query.brandId as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        inStock: req.query.inStock === 'true',
        isFeatured: req.query.isFeatured === 'true' ? true : undefined,
        sortBy: req.query.sortBy as any,
        sortOrder: req.query.sortOrder as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const { products, meta } = await ProductService.getProducts(filters);
      return ResponseUtil.paginated(res, products, meta, 'Products retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return ResponseUtil.success(res, product, 'Product retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 404);
    }
  }

  /**
   * Get product by slug
   * GET /api/products/slug/:slug
   */
  static async getBySlug(req: Request, res: Response) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);
      return ResponseUtil.success(res, product, 'Product retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 404);
    }
  }

  /**
   * Update product (Admin only)
   * PUT /api/admin/products/:id
   */
  static async update(req: Request, res: Response) {
    try {
      const { images } = req.body;

      // ✅ Validate image sizes if images are being updated
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          
          // Skip validation if image is URL (existing image)
          if (img.startsWith('http://') || img.startsWith('https://')) {
            continue;
          }
          
          // Skip if not base64
          if (!img.includes('base64,')) {
            continue;
          }
          
          const base64Data = img.split('base64,')[1];
          const sizeInMB = (Buffer.from(base64Data, 'base64').length) / (1024 * 1024);
          
          if (sizeInMB > 5) {
            return ResponseUtil.error(
              res,
              `Image ${i + 1} is too large (${sizeInMB.toFixed(2)}MB). Maximum size is 5MB per image.`,
              'IMAGE_TOO_LARGE',
              400
            );
          }
        }
      }

      const product = await ProductService.updateProduct(req.params.id, req.body);
      return ResponseUtil.success(res, product, 'Product updated');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'UPDATE_FAILED', 400);
    }
  }

  /**
   * Delete product (Admin only) - HARD DELETE with CASCADE
   * DELETE /api/admin/products/:id
   * 
   * ⚠️ WARNING: This permanently deletes:
   * - Product record
   * - All order items (product removed from orders)
   * - All cart items (product removed from carts)
   * - All wishlist items
   * - All reviews
   * - All variants (sizes/colors)
   * - All images
   * 
   * Cannot be undone!
   */
  static async delete(req: Request, res: Response) {
    try {
      console.log('🗑️ Admin delete request for product:', req.params.id);
      
      const result = await ProductService.deleteProduct(req.params.id);
      
      console.log('✅ Product deleted successfully');
      console.log('📊 Deleted counts:', result.data?.relatedDeleted);
      
      return ResponseUtil.success(
        res, 
        result, 
        'Product and all related data deleted permanently'
      );
    } catch (error: any) {
      console.error('❌ Delete failed:', error.message);
      return ResponseUtil.error(res, error.message, 'DELETE_FAILED', 400);
    }
  }

  /**
   * Get featured products
   * GET /api/products/featured
   */
  static async getFeatured(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await ProductService.getFeaturedProducts(limit);
      return ResponseUtil.success(res, products, 'Featured products retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get new arrivals
   * GET /api/products/new-arrivals
   */
  static async getNewArrivals(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await ProductService.getNewArrivals(limit);
      return ResponseUtil.success(res, products, 'New arrivals retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Get best sellers
   * GET /api/products/best-sellers
   */
  static async getBestSellers(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const products = await ProductService.getBestSellers(limit);
      return ResponseUtil.success(res, products, 'Best sellers retrieved');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  static async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? Number(req.query.limit) : 20;

      if (!query) {
        return ResponseUtil.error(res, 'Search query is required', 'NO_QUERY', 400);
      }

      const products = await ProductService.searchProducts(query, limit);
      return ResponseUtil.success(res, products, 'Search results');
    } catch (error: any) {
      return ResponseUtil.error(res, error.message, 'SEARCH_FAILED', 400);
    }
  }
}