import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import { useProductStore } from '../../store/productStore';
import { Product, FilterOptions } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

const ProductListScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { category, brand } = route.params || {};
  const {
    products,
    isLoading,
    filters,
    setFilters,
    applyFilters,
    clearFilters,
    fetchProducts,
  } = useProductStore();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('');

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  useEffect(() => {
    let filtered = products;
    
    // Apply route filters
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (brand) {
      filtered = filtered.filter(p => p.brand === brand);
    }

    // Apply additional filters
    if (Object.keys(filters).length > 0) {
      filtered = applyFilters(filters);
    }

    setFilteredProducts(filtered);
  }, [products, filters, category, brand]);

  const navigateToProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    const newFilters = { ...filters, sortBy: sortType as any };
    setFilters(newFilters);
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="p-2 -ml-2"
      >
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      
      <Text className="text-gray-900 text-lg font-bold flex-1 text-center">
        {category || brand || 'Products'}
      </Text>
      
      <TouchableOpacity
        onPress={() => navigation.navigate('Search')}
        className="p-2 -mr-2"
      >
        <Ionicons name="search" size={24} color="#374151" />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <View className="flex-row items-center space-x-4">
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full"
        >
          <Ionicons name="filter" size={16} color="#6B7280" />
          <Text className="text-gray-700 text-sm font-medium ml-2">Filter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {}}
          className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full"
        >
          <Ionicons name="swap-vertical" size={16} color="#6B7280" />
          <Text className="text-gray-700 text-sm font-medium ml-2">Sort</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-row items-center space-x-2">
        <TouchableOpacity
          onPress={() => setViewMode('grid')}
          className={`p-2 ${viewMode === 'grid' ? 'bg-primary' : 'bg-gray-100'} rounded`}
        >
          <Ionicons 
            name="grid" 
            size={16} 
            color={viewMode === 'grid' ? 'white' : '#6B7280'} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setViewMode('list')}
          className={`p-2 ${viewMode === 'list' ? 'bg-primary' : 'bg-gray-100'} rounded`}
        >
          <Ionicons 
            name="list" 
            size={16} 
            color={viewMode === 'list' ? 'white' : '#6B7280'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-20">
      <Ionicons name="search-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
        No products found
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        Try adjusting your filters or search for something else
      </Text>
      <Button
        title="Clear Filters"
        variant="outline"
        onPress={clearFilters}
      />
    </View>
  );

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => {
    if (viewMode === 'grid') {
      return (
        <ProductCard
          product={item}
          onPress={navigateToProduct}
          width={(screenWidth - 48) / 2}
        />
      );
    }
    
    // List view
    return (
      <TouchableOpacity
        onPress={() => navigateToProduct(item)}
        className="flex-row bg-white rounded-2xl shadow-sm mb-3 mx-4 overflow-hidden"
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.images[0] }}
          className="w-24 h-24"
          resizeMode="cover"
        />
        <View className="flex-1 p-4">
          <Text className="text-gray-500 text-xs uppercase font-medium mb-1">
            {item.brand}
          </Text>
          <Text className="text-gray-900 font-semibold text-base mb-2" numberOfLines={2}>
            {item.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-primary font-bold text-lg">
              ${item.price}
            </Text>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#FFA500" />
              <Text className="text-gray-600 text-sm ml-1">
                {item.rating} ({item.reviewCount})
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && filteredProducts.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderHeader()}
      {renderFilters()}
      
      {filteredProducts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          key={viewMode} // Force re-render when view mode changes
          contentContainerStyle={
            viewMode === 'grid' 
              ? { paddingHorizontal: 16, paddingVertical: 8 }
              : { paddingVertical: 8 }
          }
          columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      {/* Results count */}
      <View className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <Text className="text-gray-600 text-sm text-center">
          Showing {filteredProducts.length} products
        </Text>
      </View>

      {/* Filter Modal - Placeholder for now */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <Text className="text-lg font-bold">Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Filter options coming soon...</Text>
          </View>
          
          <View className="p-4">
            <Button
              title="Apply Filters"
              onPress={() => setShowFilters(false)}
              fullWidth
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductListScreen;