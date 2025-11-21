// SportShopApp/src/screens/home/HomeScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const {
    products,
    categories,
    featuredProducts,
    isLoading,
    fetchProducts,
    fetchCategories,
  } = useProductStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const navigateToProduct = (product: any) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const navigateToCategory = (category: any) => {
    navigation.navigate('Products', { categoryId: category.id });
  };

  const renderBanner = () => (
    <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
      <LinearGradient
        colors={['#FF6B35', '#FF8E35']}
        style={{
          borderRadius: 16,
          padding: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            Summer Sale 🔥
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 16 }}>
            Up to 50% off on selected items
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
              Shop Now
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            width: 96,
            height: 96,
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 48,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="flash" size={32} color="white" />
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategories = () => (
    <View style={{ marginBottom: 32 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
          Categories
        </Text>
        <TouchableOpacity>
          <Text style={{ color: '#FF6B35', fontWeight: '600' }}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigateToCategory(item)}
            style={{ marginRight: 16, alignItems: 'center' }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: '#F3F4F6',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 28 }}>{item.icon || '📦'}</Text>
            </View>
            <Text
              style={{
                color: '#374151',
                fontSize: 14,
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderFeaturedProducts = () => {
    if (!featuredProducts || featuredProducts.length === 0) return null;

    return (
      <View style={{ marginBottom: 32 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
            Featured Products
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={{ color: '#FF6B35', fontWeight: '600' }}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredProducts.slice(0, 5)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigateToProduct(item)}
              style={{
                marginRight: 16,
                width: screenWidth * 0.7,
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              {item.images && item.images[0] ? (
                <Image
                  source={{ uri: item.images[0].url || item.images[0] }}
                  style={{ width: '100%', height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: '100%',
                    height: 200,
                    backgroundColor: '#E5E7EB',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#9CA3AF' }}>No Image</Text>
                </View>
              )}

              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    marginBottom: 4,
                  }}
                >
                  {item.brand?.name || 'Brand'}
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: 8,
                  }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      color: '#FF6B35',
                    }}
                  >
                    ${Number(item.price || 0).toFixed(2)}
                  </Text>
                  {item.originalPrice && Number(item.originalPrice) > Number(item.price) && (
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#9CA3AF',
                        textDecorationLine: 'line-through',
                        marginLeft: 8,
                      }}
                    >
                      ${Number(item.originalPrice).toFixed(2)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  if (isLoading && products.length === 0) {
    return <LoadingSpinner fullScreen text="Loading products..." />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: 'white',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#6B7280', fontSize: 14 }}>Good morning</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
            {user?.firstName || 'Guest'} 👋
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={{
              backgroundColor: '#F3F4F6',
              padding: 12,
              borderRadius: 20,
            }}
          >
            <Ionicons name="search" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#F3F4F6',
              padding: 12,
              borderRadius: 20,
              position: 'relative',
            }}
          >
            <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                backgroundColor: '#EF4444',
                borderRadius: 4,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadData}
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
      >
        {renderBanner()}
        {renderCategories()}
        {renderFeaturedProducts()}

        {/* Bottom Spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;