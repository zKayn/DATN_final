// SportShopApp/src/screens/product/ProductDetailScreen.tsx
// ✅ UPDATED: Added Reviews section with Write Review button

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import apiService from '../../services/api'; // ✅ ADD

const { width: screenWidth } = Dimensions.get('window');

const ProductDetailScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { productId } = route.params;
  const { selectedProduct, fetchProductById, isLoading } = useProductStore();
  const { addToCart } = useCartStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // ✅ ADD: Reviews state
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadProduct();
    loadReviews(); // ✅ ADD
  }, [productId]);

  const loadProduct = async () => {
    try {
      await fetchProductById(productId);
    } catch (error) {
      console.error('Load product error:', error);
      Alert.alert('Error', 'Failed to load product');
    }
  };

  // ✅ ADD: Load reviews function
  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await apiService.getProductReviews(productId, {
        page: 1,
        limit: 3,
        sortBy: 'recent',
      });
      if (response.success) {
        setReviewsData(response.data);
      }
    } catch (error) {
      console.error('Load reviews error:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  // ===== COMPUTED VALUES USING USEMEMO =====
  const images = useMemo(() => {
    return Array.isArray(selectedProduct?.images) ? selectedProduct.images : [];
  }, [selectedProduct]);

  const availableSizes = useMemo(() => {
    const variants = Array.isArray((selectedProduct as any)?.variants) ? (selectedProduct as any).variants : [];
    return [...new Set(variants.map((v: any) => v?.size).filter(Boolean))] as string[];
  }, [selectedProduct]);

  const availableColors = useMemo(() => {
    const variants = Array.isArray((selectedProduct as any)?.variants) ? (selectedProduct as any).variants : [];
    return [...new Set(variants.map((v: any) => v?.color).filter(Boolean))] as string[];
  }, [selectedProduct]);

  const getColorCode = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      white: '#FFFFFF',
      black: '#000000',
      red: '#EF4444',
      blue: '#3B82F6',
      green: '#10B981',
      yellow: '#FCD34D',
      gray: '#6B7280',
      orange: '#F97316',
      purple: '#A855F7',
      pink: '#EC4899',
    };
    return colorMap[colorName?.toLowerCase()] || '#9CA3AF';
  };

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    const hasVariants = availableSizes.length > 0 || availableColors.length > 0;

    if (hasVariants) {
      if (availableSizes.length > 0 && !selectedSize) {
        Alert.alert('Size Required', 'Please select a size');
        return;
      }
      if (availableColors.length > 0 && !selectedColor) {
        Alert.alert('Color Required', 'Please select a color');
        return;
      }
    }

    try {
      setIsAddingToCart(true);
      await addToCart(
        selectedProduct,
        selectedSize || 'One Size',
        selectedColor || 'Default',
        quantity
      );

      Alert.alert(
        'Added to Cart',
        `${selectedProduct.name} has been added to your cart`,
        [
          { text: 'Continue Shopping', style: 'default' },
          {
            text: 'View Cart',
            onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Add to cart error:', error);
      Alert.alert('Error', error.message || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // ✅ ADD: Navigate to write review
  const handleWriteReview = () => {
    if (!selectedProduct) return;
    
    const firstImage = images[0];
    const imageUrl = typeof firstImage === 'string' ? firstImage : (firstImage as any)?.url || '';
    
    navigation.navigate('WriteReview', {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: imageUrl,
    });
  };

  // ===== LOADING STATE =====
  if (isLoading || !selectedProduct) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading product...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const product = selectedProduct;

  // ===== RENDER FUNCTIONS =====
  const renderImageGallery = () => {
    if (images.length === 0) {
      return (
        <View
          style={{
            width: screenWidth,
            height: 400,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="image-outline" size={64} color="#9CA3AF" />
          <Text style={{ color: '#9CA3AF', marginTop: 8 }}>No image available</Text>
        </View>
      );
    }

    return (
      <View style={{ position: 'relative' }}>
        <FlatList
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setSelectedImageIndex(index);
          }}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const imageUrl = typeof item === 'string' ? item : (item as any)?.url;
            return (
              <Image
                source={{ uri: imageUrl }}
                style={{ width: screenWidth, height: 400 }}
                resizeMode="cover"
              />
            );
          }}
        />

        {images.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 16,
              left: 0,
              right: 0,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            {images.map((_: any, index: number) => (
              <View
                key={index}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === selectedImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                  marginHorizontal: 4,
                }}
              />
            ))}
          </View>
        )}

        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: 8,
              borderRadius: 20,
            }}
          >
            <Ionicons name="heart-outline" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
          <View style={{ position: 'absolute', top: 60, left: 16 }}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                -
                {Math.round(
                  ((Number(product.originalPrice) - Number(product.price)) /
                    Number(product.originalPrice)) *
                    100
                )}
                %
              </Text>
            </LinearGradient>
          </View>
        )}
      </View>
    );
  };

  const renderProductInfo = () => (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: '#FF6B35',
            textTransform: 'uppercase',
            fontWeight: '600',
          }}
        >
          {(product.brand as any)?.name || 'Brand'}
        </Text>
        <View
          style={{
            backgroundColor: (product as any).stock > 0 ? '#D1FAE5' : '#FEE2E2',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: (product as any).stock > 0 ? '#059669' : '#DC2626',
              fontSize: 12,
              fontWeight: '600',
            }}
          >
            {(product as any).stock > 0 ? `${(product as any).stock} in stock` : 'Out of stock'}
          </Text>
        </View>
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 16,
        }}
      >
        {product.name}
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#FF6B35' }}>
          ${Number(product.price).toFixed(2)}
        </Text>
        {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
          <Text
            style={{
              fontSize: 18,
              color: '#9CA3AF',
              textDecorationLine: 'line-through',
              marginLeft: 12,
            }}
          >
            ${Number(product.originalPrice).toFixed(2)}
          </Text>
        )}
      </View>

      <Text
        style={{
          fontSize: 15,
          color: '#374151',
          lineHeight: 24,
        }}
      >
        {product.description}
      </Text>
    </View>
  );

  const renderSizeSelector = () => {
    if (availableSizes.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
          Select Size
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {availableSizes.map((size: string) => (
            <TouchableOpacity
              key={size}
              onPress={() => setSelectedSize(size)}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 12,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: selectedSize === size ? '#FF6B35' : '#E5E7EB',
                backgroundColor: selectedSize === size ? '#FFF4ED' : 'white',
                marginRight: 12,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  color: selectedSize === size ? '#FF6B35' : '#374151',
                }}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderColorSelector = () => {
    if (availableColors.length === 0) return null;

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
          Select Color
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {availableColors.map((color: string) => (
            <TouchableOpacity
              key={color}
              onPress={() => setSelectedColor(color)}
              style={{
                marginRight: 16,
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: getColorCode(color),
                  borderWidth: 3,
                  borderColor: selectedColor === color ? '#FF6B35' : '#E5E7EB',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {selectedColor === color && (
                  <Ionicons
                    name="checkmark"
                    size={24}
                    color={color?.toLowerCase() === 'white' ? '#374151' : 'white'}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: '#6B7280',
                  textAlign: 'center',
                  marginTop: 4,
                }}
              >
                {color}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderQuantitySelector = () => (
    <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
        Quantity
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity
          onPress={() => setQuantity(Math.max(1, quantity - 1))}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          disabled={quantity <= 1}
        >
          <Ionicons name="remove" size={20} color="#374151" />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#111827',
            marginHorizontal: 24,
          }}
        >
          {quantity}
        </Text>

        <TouchableOpacity
          onPress={() => setQuantity(quantity + 1)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="add" size={20} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ ADD: Reviews section
  const renderReviewsSection = () => {
    const stats = reviewsData?.stats || { averageRating: 0, total: 0 };
    const reviews = reviewsData?.reviews || [];

    return (
      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
              Reviews
            </Text>
            {stats.total > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Ionicons name="star" size={16} color="#FFA500" />
                <Text style={{ fontSize: 14, color: '#6B7280', marginLeft: 4 }}>
                  {stats.averageRating.toFixed(1)} ({stats.total} reviews)
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={handleWriteReview}
            style={{
              backgroundColor: '#FF6B35',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="star-outline" size={16} color="white" />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600', marginLeft: 6 }}>
              Write Review
            </Text>
          </TouchableOpacity>
        </View>

        {loadingReviews ? (
          <ActivityIndicator color="#FF6B35" style={{ marginVertical: 20 }} />
        ) : reviews.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 32, backgroundColor: '#F9FAFB', borderRadius: 12 }}>
            <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 12 }}>
              No reviews yet
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4 }}>
              Be the first to review this product!
            </Text>
          </View>
        ) : (
          <View>
            {reviews.slice(0, 3).map((review: any) => (
              <View key={review.id} style={{ backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color={star <= review.rating ? '#FFA500' : '#D1D5DB'}
                      />
                    ))}
                  </View>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.title && (
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
                    {review.title}
                  </Text>
                )}
                {review.comment && (
                  <Text style={{ fontSize: 14, color: '#374151' }} numberOfLines={3}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))}
            
            {stats.total > 3 && (
              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ color: '#FF6B35', fontSize: 14, fontWeight: '600' }}>
                  View all {stats.total} reviews →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderSizeSelector()}
        {renderColorSelector()}
        {renderQuantitySelector()}
        {renderReviewsSection()} {/* ✅ ADD */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={{
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isAddingToCart || (product as any).stock <= 0}
          style={{
            backgroundColor: (product as any).stock > 0 ? '#FF6B35' : '#9CA3AF',
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isAddingToCart ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="bag-add" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Add to Cart - ${(Number(product.price) * quantity).toFixed(2)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;