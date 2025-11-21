// SportShopApp/src/components/ProductReviews.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  adminReply?: string;
  user: {
    firstName?: string;
    lastName?: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  averageRating?: number;
  reviewCount?: number;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  averageRating = 0,
  reviewCount = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'helpful' | 'rating'>('recent');

  useEffect(() => {
    loadReviews();
  }, [filterRating, sortBy]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductReviews(productId, {
        rating: filterRating || undefined,
        sortBy,
        limit: 10,
      });

      if (response.success) {
        setReviews(response.data.reviews || []);
        setStats(response.data.stats || null);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await apiService.markReviewHelpful(reviewId);
      loadReviews(); // Reload to update helpful count
    } catch (error) {
      console.error('Mark helpful error:', error);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? '#FFA500' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    const total = stats.total || 1;

    return (
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution?.[star] || 0;
          const percentage = (count / total) * 100;

          return (
            <TouchableOpacity
              key={star}
              onPress={() => setFilterRating(filterRating === star ? null : star)}
              style={[
                styles.distributionRow,
                filterRating === star && styles.distributionRowActive,
              ]}
            >
              <Text style={styles.distributionStar}>{star}★</Text>
              <View style={styles.distributionBarContainer}>
                <View
                  style={[
                    styles.distributionBar,
                    { width: `${percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.distributionCount}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderReview = (review: Review) => {
    const userName = review.user.firstName
      ? `${review.user.firstName} ${review.user.lastName || ''}`.trim()
      : 'Anonymous';

    return (
      <View key={review.id} style={styles.reviewCard}>
        {/* Header */}
        <View style={styles.reviewHeader}>
          <View style={styles.reviewUserInfo}>
            <View style={styles.reviewAvatar}>
              <Text style={styles.reviewAvatarText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.reviewUserName}>{userName}</Text>
              <Text style={styles.reviewDate}>
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          {review.isVerifiedPurchase && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>

        {/* Rating */}
        {renderStars(review.rating, 18)}

        {/* Title */}
        {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}

        {/* Comment */}
        {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
            {review.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}

        {/* Admin Reply */}
        {review.adminReply && (
          <View style={styles.adminReply}>
            <Text style={styles.adminReplyLabel}>Store Response:</Text>
            <Text style={styles.adminReplyText}>{review.adminReply}</Text>
          </View>
        )}

        {/* Helpful Button */}
        <TouchableOpacity
          onPress={() => handleMarkHelpful(review.id)}
          style={styles.helpfulButton}
        >
          <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
          <Text style={styles.helpfulText}>
            Helpful ({review.helpfulCount})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.overallRating}>
        <View style={styles.overallRatingLeft}>
          <Text style={styles.overallRatingNumber}>{averageRating.toFixed(1)}</Text>
          {renderStars(Math.round(averageRating), 20)}
          <Text style={styles.overallRatingText}>{reviewCount} reviews</Text>
        </View>
        {renderRatingDistribution()}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {['recent', 'helpful', 'rating'].map((sort) => (
            <TouchableOpacity
              key={sort}
              onPress={() => setSortBy(sort as any)}
              style={[
                styles.sortButton,
                sortBy === sort && styles.sortButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.sortButtonText,
                  sortBy === sort && styles.sortButtonTextActive,
                ]}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No reviews yet</Text>
          <Text style={styles.emptyStateSubtext}>Be the first to review this product!</Text>
        </View>
      ) : (
        <View style={styles.reviewsList}>
          {reviews.map(renderReview)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallRating: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 16,
  },
  overallRatingLeft: {
    alignItems: 'center',
    marginBottom: 20,
  },
  overallRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  overallRatingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  distributionContainer: {
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  distributionRowActive: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    marginHorizontal: -8,
    borderRadius: 8,
  },
  distributionStar: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 32,
  },
  distributionBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBar: {
    height: '100%',
    backgroundColor: '#FFA500',
  },
  distributionCount: {
    fontSize: 14,
    color: '#6B7280',
    width: 32,
    textAlign: 'right',
  },
  sortContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  sortButtonActive: {
    backgroundColor: '#FF6B35',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginTop: 8,
  },
  reviewImages: {
    marginTop: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  adminReply: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
  },
  adminReplyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  adminReplyText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  helpfulText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'white',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});

export default ProductReviews;