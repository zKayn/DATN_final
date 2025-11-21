// backend/src/routes/product.routes.ts

import { Router } from 'express';
import { ProductService } from '../services/product.service';
import { ResponseUtil } from '../utils/response';
import { Request, Response } from 'express';

const router = Router();

// Get all products
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const categoryId = req.query.categoryId as string | undefined;
    const brandId = req.query.brandId as string | undefined;
    const search = req.query.search as string | undefined;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const inStock = req.query.inStock === 'true' ? true : undefined;
    const isFeatured = req.query.isFeatured === 'true' ? true : undefined;
    const sortBy = req.query.sortBy as string | undefined;
    const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

    // Call service with filter object
    const result = await ProductService.getProducts({
      page,
      limit,
      categoryId,
      brandId,
      search,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sortBy,
      sortOrder,
    });

    return ResponseUtil.paginated(res, result.products, result.meta, 'Products retrieved');
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
  }
});

// Get featured products
router.get('/featured', async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getFeaturedProducts();
    return ResponseUtil.success(res, products, 'Featured products retrieved');
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
  }
});

// Search products
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    if (!query) {
      return ResponseUtil.error(res, 'Search query is required', 'INVALID_QUERY', 400);
    }

    const products = await ProductService.searchProducts(query, limit);
    return ResponseUtil.success(res, products, 'Search results retrieved');
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 'SEARCH_FAILED', 400);
  }
});

// Get product by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductById(id);
    
    if (!product) {
      return ResponseUtil.error(res, 'Product not found', 'NOT_FOUND', 404);
    }

    return ResponseUtil.success(res, product, 'Product retrieved');
  } catch (error: any) {
    return ResponseUtil.error(res, error.message, 'FETCH_FAILED', 400);
  }
});

export default router;