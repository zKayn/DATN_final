import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ProductCard from '../../components/common/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useProductStore } from '../../store/productStore';
import { Product } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { searchProducts, categories } = useProductStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Running Shoes',
    'Basketball',
    'Nike',
    'Workout Gear',
  ]);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Add to recent searches if not empty
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 9)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigateToProduct = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderHeader = () => (
    <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="mr-3"
      >
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      
      <View className="flex-1 flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput
          className="flex-1 ml-2 text-gray-900 text-base"
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={() => handleSearch(searchQuery)}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRecentSearches = () => (
    <View className="px-4 py-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-gray-900 text-lg font-bold">Recent Searches</Text>
        <TouchableOpacity onPress={() => setRecentSearches([])}>
          <Text className="text-primary text-sm font-semibold">Clear All</Text>
        </TouchableOpacity>
      </View>
      
      {recentSearches.map((search, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleSearch(search)}
          className="flex-row items-center justify-between py-3 border-b border-gray-100"
        >
          <View className="flex-row items-center flex-1">
            <Ionicons name="time-outline" size={20} color="#9CA3AF" />
            <Text className="text-gray-700 text-base ml-3">{search}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTrendingCategories = () => (
    <View className="px-4 py-6">
      <Text className="text-gray-900 text-lg font-bold mb-4">
        Trending Categories
      </Text>
      
      <View className="flex-row flex-wrap">
        {categories.slice(0, 6).map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => {
              navigation.navigate('Products', { category: category.name });
            }}
            className="bg-gray-100 px-4 py-2 rounded-full mr-2 mb-2"
          >
            <Text className="text-gray-700 font-medium">
              {category.icon} {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSearchResults = () => {
    if (isSearching) {
      return <LoadingSpinner text="Searching..." />;
    }

    if (searchResults.length === 0) {
      return (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="search-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-semibold mt-4 mb-2">
            No results found
          </Text>
          <Text className="text-gray-400 text-center">
            Try searching with different keywords
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={navigateToProduct}
            width={(screenWidth - 48) / 2}
          />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="py-4">
            <Text className="text-gray-600 text-sm text-center">
              {searchResults.length} results found
            </Text>
          </View>
        }
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {renderHeader()}
      
      {searchQuery.trim() === '' ? (
        <View className="flex-1">
          {renderRecentSearches()}
          {renderTrendingCategories()}
        </View>
      ) : (
        renderSearchResults()
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;