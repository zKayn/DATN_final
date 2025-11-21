// SportShopApp/src/screens/search/SearchScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useProductStore } from '../../store/productStore';

const { width: screenWidth } = Dimensions.get('window');

const SearchScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Nike shoes',
    'Running',
    'Basketball',
  ]);

  const { categories } = useProductStore();

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setIsSearching(true);
      const { searchProducts } = useProductStore.getState();
      const results = await searchProducts(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecentSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const navigateToProduct = (product: any) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderSearchBar = () => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
        <Ionicons name="arrow-back" size={24} color="#111827" />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F3F4F6',
          borderRadius: 12,
          paddingHorizontal: 12,
          marginLeft: 12,
        }}
      >
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
          placeholderTextColor="#9CA3AF"
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 8,
            fontSize: 16,
            color: '#111827',
          }}
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={{ padding: 4 }}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRecentSearches = () => (
    <View style={{ padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
          Recent Searches
        </Text>
        <TouchableOpacity>
          <Text style={{ color: '#FF6B35', fontWeight: '600' }}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        {recentSearches.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleRecentSearch(item)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                color: '#111827',
                marginLeft: 12,
              }}
            >
              {item}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPopularCategories = () => (
    <View style={{ padding: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: 16,
        }}
      >
        Popular Categories
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {categories.slice(0, 6).map((category: any) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => navigation.navigate('Products', { categoryId: category.id })}
            style={{
              backgroundColor: '#F3F4F6',
              paddingHorizontal: 20,
              paddingVertical: 12,
              borderRadius: 20,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSearchResult = (product: any) => (
    <TouchableOpacity
      key={product.id}
      onPress={() => navigateToProduct(product)}
      style={{
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
      }}
    >
      {product.images?.[0] ? (
        <Image
          source={{ uri: product.images[0]?.url || product.images[0] }}
          style={{ width: 80, height: 80, borderRadius: 12 }}
          resizeMode="cover"
        />
      ) : (
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 12,
            backgroundColor: '#F3F4F6',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="image-outline" size={32} color="#9CA3AF" />
        </View>
      )}

      <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#111827',
            marginBottom: 4,
          }}
          numberOfLines={2}
        >
          {product.name}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: '#6B7280',
            marginBottom: 8,
          }}
        >
          {product.brand?.name || 'Brand'}
        </Text>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }}>
          ${Number(product.price).toFixed(2)}
        </Text>
      </View>

      <View style={{ justifyContent: 'center' }}>
        <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    if (isSearching) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Searching...</Text>
        </View>
      );
    }

    if (searchResults.length === 0 && searchQuery.length > 2) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="search-outline" size={64} color="#9CA3AF" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#111827',
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            No Results Found
          </Text>
          <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center' }}>
            We couldn't find any products matching "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, backgroundColor: '#F9FAFB' }}>
          <Text style={{ fontSize: 16, color: '#6B7280' }}>
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found for "
            {searchQuery}"
          </Text>
        </View>
        {searchResults.map(renderSearchResult)}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {renderSearchBar()}

      {searchQuery.length > 0 ? (
        renderSearchResults()
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {renderRecentSearches()}
          {renderPopularCategories()}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;