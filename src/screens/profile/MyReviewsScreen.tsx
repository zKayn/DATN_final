// SportShopApp/src/screens/profile/MyReviewsScreen.tsx
// FIXED VERSION - Correct navigation params

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string;
  adminReply?: string;
  product: {
    id: string;
    name: string;
    images: Array<{ url: string }>;
  };
}

interface MyReviewsScreenProps {
  navigation: any;
}

const MyReviewsScreen: React.FC<MyReviewsScreenProps> = ({ navigation }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyReviews({ limit: 50 });
      if (response.success) {
        setReviews(response.data.reviews || []);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  const handleEdit = (review: Review) => {
    // ✅ FIXED - Add all required params
    navigation.navigate('WriteReview', {
      productId: review.product.id,
      productName: review.product.name,
      productImage: review.product.images[0]?.url || '',
      reviewId: review.id,
      existingReview: {
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
      },
    });
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteReview(reviewId);
              loadReviews();
              Alert.alert('Success', 'Review deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete review');
            }
          },
        },
      ]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFA500' : '#D1D5DB'}
          />
        ))}
      </View>
    );
  };

  const renderReview = (review: Review) => {
    return (
      <View key={review.id} style={styles.reviewCard}>
        {/* Product Info */}
        <TouchableOpacity
          style={styles.productInfo}
          onPress={() =>
            navigation.navigate('ProductDetail', { productId: review.product.id })
          }
        >
          <Image
            source={{ uri: review.product.images[0]?.url }}
            style={styles.productImage}
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={2}>
              {review.product.name}
            </Text>
            <Text style={styles.reviewDate}>
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          {review.isVerifiedPurchase && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              review.isApproved ? styles.approvedBadge : styles.pendingBadge,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                review.isApproved ? styles.approvedText : styles.pendingText,
              ]}
            >
              {review.isApproved ? 'Published' : 'Pending Review'}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          {renderStars(review.rating)}
          <Text style={styles.ratingText}>{review.rating}.0</Text>
        </View>

        {/* Title */}
        {review.title && <Text style={styles.reviewTitle}>{review.title}</Text>}

        {/* Comment */}
        {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}

        {/* Images */}
        {review.images && review.images.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.images}>
            {review.images.map((img, idx) => (
              <Image key={idx} source={{ uri: img }} style={styles.reviewImage} />
            ))}
          </ScrollView>
        )}

        {/* Admin Reply */}
        {review.adminReply && (
          <View style={styles.adminReply}>
            <View style={styles.adminReplyHeader}>
              <Ionicons name="business" size={16} color="#3B82F6" />
              <Text style={styles.adminReplyLabel}>Store Response</Text>
            </View>
            <Text style={styles.adminReplyText}>{review.adminReply}</Text>
          </View>
        )}

        {/* Helpful Count */}
        <View style={styles.helpfulContainer}>
          <Ionicons name="thumbs-up-outline" size={16} color="#6B7280" />
          <Text style={styles.helpfulText}>
            {review.helpfulCount} people found this helpful
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleEdit(review)}
          >
            <Ionicons name="create-outline" size={18} color="#3B82F6" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(review.id)}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {reviews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateTitle}>No Reviews Yet</Text>
            <Text style={styles.emptyStateText}>
              Start reviewing products you've purchased!
            </Text>
          </View>
        ) : (
          <View style={styles.reviewsList}>
            {reviews.map(renderReview)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  reviewsList: {
    padding: 16,
    gap: 16,
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#DBEAFE',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  approvedText: {
    color: '#3B82F6',
  },
  pendingText: {
    color: '#F59E0B',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  images: {
    marginBottom: 12,
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
    borderRadius: 8,
    marginBottom: 12,
  },
  adminReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  adminReplyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  adminReplyText: {
    fontSize: 14,
    color: '#1E3A8A',
    lineHeight: 20,
  },
  helpfulContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 12,
  },
  helpfulText: {
    fontSize: 12,
    color: '#6B7280',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default MyReviewsScreen;