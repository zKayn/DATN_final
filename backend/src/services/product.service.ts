import prisma from '../config/database';
import { CreateProductDTO, UpdateProductDTO, ProductFilterDTO } from '../types';
import { SlugUtil } from '../utils/slug';
import { ResponseUtil } from '../utils/response';

export class ProductService {
  /**
   * Create new product
   */
  static async createProduct(data: CreateProductDTO) {
    // Generate slug
    const slug = SlugUtil.generateSlug(data.name);

    // Check if slug exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    const finalSlug = existingProduct 
      ? SlugUtil.generateUniqueSlug(data.name) 
      : slug;

    // Create product
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        sku: data.sku,
        stock: data.stock,
        categoryId: data.categoryId,
        brandId: data.brandId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        images: data.images 
          ? {
              create: data.images.map((url, index) => ({
                url,
                order: index,
              })),
            }
          : undefined,
        variants: data.variants
          ? {
              create: data.variants.map(v => ({
                size: v.size,
                color: v.color,
                stock: v.stock,
                sku: v.sku,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return product;
  }

  /**
   * Get all products with filters and pagination
   */
  static async getProducts(filters: ProductFilterDTO) {
    const {
      search,
      categoryId,
      brandId,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (inStock === true) {
      where.stock = { gt: 0 };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    // Count total
    const total = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
        variants: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const meta = ResponseUtil.generatePaginationMeta(total, page, limit);

    return { products, meta };
  }

  /**
   * Get product by ID
   */
  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count
    await prisma.product.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  /**
   * Get product by slug
   */
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Increment view count
    await prisma.product.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return product;
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: UpdateProductDTO) {
    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return product;
  }

  /**
   * Delete product permanently with all related data (CASCADE)
   * ⚠️ This will delete:
   * - Order items (product removed from orders)
   * - Cart items (product removed from carts)
   * - Wishlist items
   * - Reviews
   * - Variants
   * - Images
   */
  static async deleteProduct(id: string) {
    try {
      console.log('🗑️ Starting hard delete for product:', id);

      // ⚠️ CRITICAL: Delete in reverse dependency order
      
      // 1. Delete order items first (most dependent)
      const deletedOrderItems = await prisma.orderItem.deleteMany({
        where: { productId: id },
      });
      console.log('  ✅ Deleted order items:', deletedOrderItems.count);

      // 2. Delete cart items
      const deletedCartItems = await prisma.cartItem.deleteMany({
        where: { productId: id },
      });
      console.log('  ✅ Deleted cart items:', deletedCartItems.count);

      // 3. Delete wishlist items
      // const deletedWishlistItems = await prisma.wishlistItem.deleteMany({
      //   where: { productId: id },
      // });
      // console.log('  ✅ Deleted wishlist items:', deletedWishlistItems.count);

      // 4. Delete reviews
      const deletedReviews = await prisma.review.deleteMany({
        where: { productId: id },
      });
      console.log('  ✅ Deleted reviews:', deletedReviews.count);

      // 5. Delete product variants
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: { productId: id },
      });
      console.log('  ✅ Deleted variants:', deletedVariants.count);

      // 6. Delete product images
      const deletedImages = await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      console.log('  ✅ Deleted images:', deletedImages.count);

      // 7. Finally, delete the product itself
      const deletedProduct = await prisma.product.delete({
        where: { id },
      });
      console.log('  ✅ Deleted product:', deletedProduct.name);

      return {
        success: true,
        message: 'Product and all related data deleted permanently',
        data: {
          product: deletedProduct,
          relatedDeleted: {
            orderItems: deletedOrderItems.count,
            cartItems: deletedCartItems.count,
            // wishlistItems: deletedWishlistItems.count,
            reviews: deletedReviews.count,
            variants: deletedVariants.count,
            images: deletedImages.count,
          },
        },
      };
    } catch (error: any) {
      console.error('❌ Hard delete product error:', error);
      
      // More specific error messages
      if (error.code === 'P2003') {
        throw new Error('Cannot delete product: Foreign key constraint violation. Some references still exist.');
      }
      
      if (error.code === 'P2025') {
        throw new Error('Product not found');
      }
      
      throw new Error(error.message || 'Failed to delete product permanently');
    }
  }

  /**
   * Get featured products
   */
  static async getFeaturedProducts(limit: number = 10) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products;
  }

  /**
   * Get new arrivals
   */
  static async getNewArrivals(limit: number = 10) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return products;
  }

  /**
   * Get best sellers
   */
  static async getBestSellers(limit: number = 10) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { soldCount: 'desc' },
      take: limit,
    });

    return products;
  }

  /**
   * Search products
   */
  static async searchProducts(query: string, limit: number = 20) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      include: {
        category: true,
        brand: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
      take: limit,
    });

    return products;
  }
}