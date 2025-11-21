import React, { useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useProductStore } from '../store/productStore';
import { useAuthStore } from '../store/authStore';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { 
    featuredProducts, 
    categories, 
    fetchFeaturedProducts, 
    fetchCategories, 
    isLoading,
    error 
  } = useProductStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchFeaturedProducts(),
        fetchCategories(),
      ]);
    } catch (err) {
      console.error('Load data error:', err);
    }
  };

  if (isLoading && featuredProducts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.welcome}>
          Welcome{user ? `, ${user.firstName}` : ''}!
        </Text>
        <Text style={styles.subtitle}>Find your perfect sports gear</Text>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Products', { categoryId: category.id })}
            >
              <Text style={styles.categoryIcon}>{category.icon || '📦'}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {featuredProducts.length === 0 ? (
          <Text style={styles.emptyText}>No featured products available</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredProducts.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
              >
                {product.images && product.images.length > 0 && (
                  <Image
                    source={{ 
                      uri: typeof product.images[0] === 'string' 
                        ? product.images[0] 
                        : product.images[0].url 
                    }}
                    style={styles.productImage}
                  />
                )}
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productBrand}>{product.brand.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>${product.price}</Text>
                  {product.originalPrice && (
                    <Text style={styles.originalPrice}>${product.originalPrice}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  seeAll: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    minWidth: 80,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000',
  },
  productCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    margin: 8,
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 8,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});