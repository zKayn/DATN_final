// SportShopApp/src/screens/wishlist/WishlistScreen.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../../services/api';

// ✅ ADD TYPE DEFINITIONS
interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  stock: number;
  averageRating: number;
  reviewCount: number;
  images: Array<{ imageUrl: string }>;
  category: { name: string };
}

interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: WishlistProduct;
}

const WishlistScreen: React.FC = () => {
  const navigation = useNavigation();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async (pageNum: number = 1) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      }

      // ✅ FIX: Use apiService instead of wishlistApi
      const response = await apiService.getWishlist({
        page: pageNum,
        limit: 10,
      });

      if (pageNum === 1) {
        setWishlistItems(response.data.items);
      } else {
        setWishlistItems((prev) => [...prev, ...response.data.items]);
      }

      setHasMore(
        response.data.pagination.page < response.data.pagination.totalPages
      );
      setPage(pageNum);
    } catch (error: any) {
      console.error('❌ Fetch wishlist error:', error);
      Alert.alert('Error', 'Failed to load wishlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWishlist(1);
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchWishlist(page + 1);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      Alert.alert(
        'Remove from Wishlist',
        'Are you sure you want to remove this item?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              // ✅ FIX: Use apiService
              await apiService.removeFromWishlist(productId);
              setWishlistItems((prev) =>
                prev.filter((item) => item.productId !== productId)
              );
              Alert.alert('Success', 'Removed from wishlist');
            },
          },
        ]
      );
    } catch (error) {
      console.error('❌ Remove error:', error);
      Alert.alert('Error', 'Failed to remove from wishlist');
    }
  };

  const handleClearWishlist = async () => {
    if (wishlistItems.length === 0) return;

    Alert.alert(
      'Clear Wishlist',
      'Are you sure you want to clear all items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // ✅ FIX: Use apiService
              await apiService.clearWishlist();
              setWishlistItems([]);
              Alert.alert('Success', 'Wishlist cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear wishlist');
            }
          },
        },
      ]
    );
  };

  const handleProductPress = (productId: string) => {
    // ✅ FIX: Proper type casting
    (navigation as any).navigate('ProductDetail', { productId });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => {
    const product = item.product;
    const imageUrl = product.images[0]?.imageUrl || '';
    const currentPrice = product.salePrice || product.price;
    const hasDiscount = product.salePrice && product.salePrice < product.price;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        onPress={() => handleProductPress(product.id)}
        activeOpacity={0.7}
      >
        {/* Product Image */}
        <Image source={{ uri: imageUrl }} style={styles.productImage} />

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>

          <Text style={styles.categoryText}>{product.category.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Icon name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>
              {product.averageRating.toFixed(1)} ({product.reviewCount})
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              {formatCurrency(currentPrice)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>
                {formatCurrency(product.price)}
              </Text>
            )}
          </View>

          {/* Stock Status */}
          {product.stock === 0 ? (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          ) : product.stock < 10 ? (
            <Text style={styles.lowStock}>Only {product.stock} left</Text>
          ) : null}
        </View>

        {/* Remove Button */}
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFromWishlist(product.id)}
        >
          <Icon name="close" size={20} color="#666" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="favorite-border" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
      <Text style={styles.emptyText}>
        Add products you love to your wishlist
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => (navigation as any).navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        {wishlistItems.length > 0 && (
          <TouchableOpacity onPress={handleClearWishlist}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Wishlist Items */}
      <FlatList
        data={wishlistItems}
        renderItem={renderWishlistItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          wishlistItems.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 12,
  },
  emptyList: {
    flexGrow: 1,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  lowStock: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export default WishlistScreen;