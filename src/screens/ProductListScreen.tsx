// SportShopApp/src/screens/ProductListScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useProductStore } from '../store/productStore';

export default function ProductListScreen({ navigation, route }: any) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const categoryId = route?.params?.categoryId;
  
  const productStore = useProductStore();
  const products = productStore?.products || [];
  const isLoading = productStore?.isLoading || false;
  const error = productStore?.error || null;

  useEffect(() => {
    loadProducts();
  }, [categoryId]);

  const loadProducts = async () => {
    try {
      console.log('📦 Loading products...');
      if (productStore?.fetchProducts) {
        await productStore.fetchProducts(categoryId);
      }
      setIsInitialLoading(false);
    } catch (error) {
      console.error('❌ Load products error:', error);
      setIsInitialLoading(false);
    }
  };

  const renderProduct = ({ item }: any) => {
    if (!item) return null;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => {
          if (item.id) {
            navigation.navigate('ProductDetail', { productId: item.id });
          }
        }}
      >
        {item.images?.[0] ? (
          <Image
            source={{ uri: String(item.images[0].url || item.images[0]) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {String(item.name || 'Product')}
          </Text>
          
          <Text style={styles.brandName}>
            {String(item.brand?.name || 'Brand')}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ${Number(item.price || 0).toFixed(2)}
            </Text>
            
            {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
              <Text style={styles.originalPrice}>
                ${Number(item.originalPrice).toFixed(2)}
              </Text>
            )}
          </View>

          {Number(item.stock || 0) > 0 ? (
            <Text style={styles.inStock}>In Stock</Text>
          ) : (
            <Text style={styles.outOfStock}>Out of Stock</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isInitialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>😕 {String(error)}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProducts}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item: any, index: number) => String(item?.id || index)}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products available</Text>
          </View>
        }
        refreshing={isLoading}
        onRefresh={loadProducts}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E0E0E0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  inStock: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  outOfStock: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});