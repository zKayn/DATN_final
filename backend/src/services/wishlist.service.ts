// backend/src/services/wishlist.service.ts
import prisma from '../config/database';

export class WishlistService {
  
  // ==================== USER METHODS ====================
  
  /**
   * Add product to wishlist
   */
  static async addToWishlist(userId: string, productId: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      throw new Error('Product already in wishlist');
    }

    // Add to wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        productId,
      },
      include: {
        product: {
          include: {
            images: {
              orderBy: { id: 'asc' }, // ✅ FIX: Use 'id' instead of 'displayOrder'
              take: 1,
            },
            category: true,
            brand: true,
          },
        },
      },
    });

    return wishlist;
  }

  /**
   * Remove product from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string) {
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (!wishlistItem) {
      throw new Error('Product not in wishlist');
    }

    await prisma.wishlist.delete({
      where: {
        id: wishlistItem.id,
      },
    });

    return {
      message: 'Product removed from wishlist successfully',
    };
  }

  /**
   * Get user's wishlist
   */
  static async getUserWishlist(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              images: {
                orderBy: { id: 'asc' }, // ✅ FIX
                take: 1,
              },
              category: true,
              brand: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({
        where: { userId },
      }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if product is in wishlist
   */
  static async isInWishlist(userId: string, productId: string) {
    const wishlistItem = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    return !!wishlistItem;
  }

  /**
   * Get wishlist count
   */
  static async getWishlistCount(userId: string) {
    const count = await prisma.wishlist.count({
      where: { userId },
    });

    return count;
  }

  /**
   * Clear wishlist
   */
  static async clearWishlist(userId: string) {
    await prisma.wishlist.deleteMany({
      where: { userId },
    });

    return {
      message: 'Wishlist cleared successfully',
    };
  }

  /**
   * Toggle wishlist (add/remove)
   */
  static async toggleWishlist(userId: string, productId: string) {
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });

      return {
        action: 'removed',
        inWishlist: false,
      };
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId,
          productId,
        },
      });

      return {
        action: 'added',
        inWishlist: true,
      };
    }
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get wishlist statistics
   */
  static async getWishlistStats() {
    const [
      totalWishlists,
      totalUsers,
      totalProducts,
      recentActivity,
    ] = await Promise.all([
      prisma.wishlist.count(),
      prisma.wishlist.groupBy({
        by: ['userId'],
        _count: true,
      }),
      prisma.wishlist.groupBy({
        by: ['productId'],
        _count: true,
      }),
      prisma.wishlist.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: {
              name: true,
              price: true,
              images: {
                orderBy: { id: 'asc' }, // ✅ FIX
                take: 1,
              },
            },
          },
          user: {
  select: {
    id: true,
    email: true,
    firstName: true,  // ✅ Nếu có firstName
    lastName: true,   // ✅ Nếu có lastName
    // fullName: true, // ❌ Không có field này
  },
}
        },
      }),
    ]);

    // Get most wishlisted products
    const mostWishlisted = await prisma.wishlist.groupBy({
      by: ['productId'],
      _count: {
        productId: true,
      },
      orderBy: {
        _count: {
          productId: 'desc',
        },
      },
      take: 10,
    });

    const mostWishlistedProducts = await Promise.all(
      mostWishlisted.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: {
            images: {
              orderBy: { id: 'asc' }, // ✅ FIX
              take: 1,
            },
          },
        });
        return {
          product,
          count: item._count.productId,
        };
      })
    );

    return {
      totalWishlists,
      totalUsers: totalUsers.length,
      totalProducts: totalProducts.length,
      averageWishlistSize: totalWishlists / (totalUsers.length || 1),
      mostWishlistedProducts,
      recentActivity,
    };
  }

  /**
   * Get all wishlists
   */
  static async getAllWishlists(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        include: {
          product: {
            include: {
              images: {
                orderBy: { id: 'asc' }, // ✅ FIX
                take: 1,
              },
              category: true,
              brand: true,
            },
          },
          user: {
  select: {
    id: true,
    email: true,
    firstName: true,  // ✅ Nếu có firstName
    lastName: true,   // ✅ Nếu có lastName
    // fullName: true, // ❌ Không có field này
  },
}
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.wishlist.count(),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}