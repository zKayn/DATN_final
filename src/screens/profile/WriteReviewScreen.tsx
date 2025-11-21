// SportShopApp/src/screens/reviews/WriteReviewScreen.tsx
// UPDATED - Support both CREATE and EDIT modes

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

interface WriteReviewScreenProps {
  navigation: any;
  route: {
    params: {
      productId: string;
      productName: string;
      productImage: string;
      orderId?: string;
      reviewId?: string; // ✅ If present = EDIT mode
      existingReview?: {
        rating: number;
        title?: string;
        comment?: string;
        images?: string[];
      };
    };
  };
}

const WriteReviewScreen: React.FC<WriteReviewScreenProps> = ({ navigation, route }) => {
  const { productId, productName, productImage, orderId, reviewId, existingReview } = route.params;
  
  // ✅ Determine mode
  const isEditMode = !!reviewId;
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // ✅ EDIT MODE - Update existing review
        console.log('📝 Updating review:', reviewId);
        await apiService.updateReview(reviewId, {
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          images: images.length > 0 ? images : undefined,
        });

        Alert.alert('Success', 'Review updated successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        // ✅ CREATE MODE - Create new review
        console.log('📝 Creating review for product:', productId);
        await apiService.createReview({
          productId,
          orderId: orderId!,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          images: images.length > 0 ? images : undefined,
        });

        Alert.alert('Success', 'Review submitted successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyOrders'),
          },
        ]);
      }
    } catch (error: any) {
      console.error('❌ Submit review error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit review';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            disabled={loading}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={40}
              color={star <= rating ? '#FFA500' : '#D1D5DB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Review' : 'Write Review'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Info */}
        <View style={styles.productCard}>
          <Image source={{ uri: productImage }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {productName}
            </Text>
            {isEditMode && (
              <View style={styles.editBadge}>
                <Ionicons name="create-outline" size={14} color="#3B82F6" />
                <Text style={styles.editBadgeText}>Editing Review</Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Rating <Text style={styles.required}>*</Text>
          </Text>
          {renderStars()}
          {rating > 0 && (
            <Text style={styles.ratingText}>
              {rating === 1 && '⭐ Poor'}
              {rating === 2 && '⭐⭐ Fair'}
              {rating === 3 && '⭐⭐⭐ Good'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </Text>
          )}
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Review Title (Optional)</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Summarize your experience"
            maxLength={100}
            editable={!loading}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Comment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Your Review <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your thoughts about this product..."
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.charCount}>{comment.length}/1000</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (loading || rating === 0 || !comment.trim()) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || rating === 0 || !comment.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons
                name={isEditMode ? 'checkmark-circle' : 'send'}
                size={20}
                color="#fff"
              />
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Review' : 'Submit Review'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button (only in edit mode) */}
        {isEditMode && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
  },
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default WriteReviewScreen;