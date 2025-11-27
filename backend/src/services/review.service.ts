// backend/src/services/review.service.ts
// ✅ FIXED FOR MONGODB - images is now string[] (not JSON string)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ReviewService {
  /**
   * Create a review
   */
  static async createReview(userId: string, data: {
    productId: string;
    orderId?: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    if (data.rating < 1 || data.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if review already exists
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId: data.productId,
      },
    });

    if (existingReview) {
      throw new Error('You have already reviewed this product. Please edit your existing review from My Reviews.');
    }

    // Create new review
    let isVerifiedPurchase = false;
    if (data.orderId) {
      const order = await prisma.order.findFirst({
        where: {
          id: data.orderId,
          userId,
          status: 'DELIVERED',
          items: {
            some: {
              productId: data.productId,
            },
          },
        },
      });

      isVerifiedPurchase = !!order;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        orderId: data.orderId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        images: data.images || [], // ✅ FIX: Direct array, no JSON.stringify
        isVerifiedPurchase,
        isApproved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await this.updateProductRating(data.productId);

    return {
      ...review,
      isUpdate: false,
    };
  }

  /**
   * Get product reviews
   */
  static async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    rating?: number,
    sortBy: 'recent' | 'helpful' | 'rating' = 'recent'
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      productId,
      isApproved: true,
    };

    if (rating) {
      where.rating = rating;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'helpful') {
      orderBy = { helpfulCount: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          helpfulVotes: {
            select: {
              userId: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // ✅ FIX: No JSON.parse needed, images is already array
    const parsedReviews = reviews.map(review => ({
      ...review,
      // images is already string[], no parsing needed
    }));

    const ratingStats = await this.getProductRatingStats(productId);

    return {
      reviews: parsedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: ratingStats,
    };
  }

  /**
   * Get product rating statistics
   */
  static async getProductRatingStats(productId: string) {
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
      select: {
        rating: true,
      },
    });

    const total = reviews.length;
    const averageRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    const distribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    };

    return {
      total,
      averageRating: Number(averageRating.toFixed(1)),
      distribution,
    };
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { userId } }),
    ]);

    // ✅ FIX: No JSON.parse needed
    const parsedReviews = reviews.map(review => ({
      ...review,
      // images is already string[]
    }));

    return {
      reviews: parsedReviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update review
   */
  static async updateReview(reviewId: string, userId: string, data: {
    rating?: number;
    title?: string;
    comment?: string;
    images?: string[];
  }) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to update this review');
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updateData: any = {
      isApproved: false,
    };

    if (data.rating) updateData.rating = data.rating;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.images) updateData.images = data.images; // ✅ FIX: Direct array

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    await this.updateProductRating(review.productId);

    return {
      ...updatedReview,
      // images is already string[]
    };
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    if (review.userId !== userId) {
      throw new Error('Unauthorized to delete this review');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await this.updateProductRating(review.productId);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Mark review as helpful
   */
  static async markReviewHelpful(reviewId: string, userId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    const existingVote = await prisma.reviewHelpfulVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existingVote) {
      await prisma.reviewHelpfulVote.delete({
        where: { id: existingVote.id },
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });

      return { helpful: false };
    } else {
      await prisma.reviewHelpfulVote.create({
        data: {
          reviewId,
          userId,
        },
      });

      await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });

      return { helpful: true };
    }
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Admin: Get all reviews
   */
  static async getAllReviews(
    page: number = 1,
    limit: number = 20,
    status?: 'pending' | 'approved' | 'all',
    rating?: number
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status === 'pending') {
      where.isApproved = false;
    } else if (status === 'approved') {
      where.isApproved = true;
    }

    if (rating) {
      where.rating = rating;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              images: {
                select: { url: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // ✅ FIX: No JSON.parse, just add status field
    const parsedReviews = reviews.map(review => ({
      ...review,
      status: review.isApproved ? 'APPROVED' : 'PENDING',
      product: {
        ...review.product,
        images: review.product.images.map(img => img.url),
      },
    }));

    return parsedReviews;
  }

  /**
   * Admin: Get review statistics
   */
  static async getReviewStats() {
    console.log('📊 ReviewService: Calculating stats...');

    const total = await prisma.review.count();
    console.log('- Total reviews:', total);

    const avgResult = await prisma.review.aggregate({
      _avg: {
        rating: true,
      },
    });
    console.log('- Avg rating:', avgResult._avg.rating);

    const [approved, pending] = await Promise.all([
      prisma.review.count({ where: { isApproved: true } }),
      prisma.review.count({ where: { isApproved: false } }),
    ]);
    console.log('- Approved:', approved, '| Pending:', pending);

    const stats = {
      total,
      averageRating: Number((avgResult._avg.rating || 0).toFixed(1)),
      byStatus: {
        pending,
        approved,
        rejected: 0,
      },
    };

    console.log('✅ Stats calculated:', stats);
    return stats;
  }

  /**
   * Admin: Update review status
   */
  static async updateReviewStatus(reviewId: string, status: string) {
    console.log(`📝 ReviewService: Updating review ${reviewId} to ${status}...`);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    let isApproved: boolean;
    if (status === 'APPROVED') {
      isApproved = true;
    } else if (status === 'REJECTED' || status === 'PENDING') {
      isApproved = false;
    } else {
      throw new Error('Invalid status. Must be APPROVED, REJECTED, or PENDING');
    }

    console.log(`- Setting isApproved to: ${isApproved}`);

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: {
              select: { url: true },
              take: 1,
            },
          },
        },
      },
    });

    await this.updateProductRating(review.productId);

    console.log('✅ Review status updated successfully');

    // ✅ FIX: No JSON.parse needed
    return {
      ...updatedReview,
      status: isApproved ? 'APPROVED' : 'PENDING',
      product: {
        ...updatedReview.product,
        images: updatedReview.product.images.map(img => img.url),
      },
    };
  }

  /**
   * Admin: Delete any review
   */
  static async deleteReviewAdmin(reviewId: string) {
    console.log(`🗑️ ReviewService: Deleting review ${reviewId}...`);

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new Error('Review not found');
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    await this.updateProductRating(review.productId);

    console.log('✅ Review deleted successfully');
    return { message: 'Review deleted successfully' };
  }

  /**
   * Admin: Approve review
   */
  static async approveReview(reviewId: string) {
    return this.updateReviewStatus(reviewId, 'APPROVED');
  }

  /**
   * Admin: Reject review
   */
  static async rejectReview(reviewId: string) {
    return this.updateReviewStatus(reviewId, 'REJECTED');
  }

  /**
   * Admin: Reply to review
   */
  static async replyToReview(reviewId: string, adminReply: string) {
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        adminReply,
        adminReplyAt: new Date(),
      },
    });

    // ✅ FIX: No JSON.parse needed
    return {
      ...review,
      // images is already string[]
    };
  }

  // ==================== HELPER METHODS ====================

  /**
   * Update product rating and review count
   */
  private static async updateProductRating(productId: string) {
    const stats = await this.getProductRatingStats(productId);

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: stats.averageRating,
        reviewCount: stats.total,
      },
    });
  }

  /**
   * Check if user can review product
   */
  static async canUserReviewProduct(userId: string, productId: string) {
    const order = await prisma.order.findFirst({
      where: {
        userId,
        status: 'DELIVERED',
        items: {
          some: {
            productId,
          },
        },
      },
      include: {
        items: {
          where: {
            productId,
          },
        },
      },
    });

    if (!order) {
      return { canReview: false, reason: 'You must purchase this product before reviewing' };
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      return { canReview: false, reason: 'You have already reviewed this product' };
    }

    return { canReview: true, orderId: order.id };
  }
}