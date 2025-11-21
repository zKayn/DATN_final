import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onWishlistPress?: (product: Product) => void;
  isWishlisted?: boolean;
  width?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onWishlistPress,
  isWishlisted = false,
  width = screenWidth * 0.45,
}) => {
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden"
      style={{ width }}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full rounded-t-2xl"
          style={{ height: width * 0.8 }}
          resizeMode="cover"
        />
        
        {/* Badges */}
        <View className="absolute top-3 left-3 flex-row">
          {product.isNew && (
            <View className="bg-green-500 px-2 py-1 rounded-full mr-2">
              <Text className="text-white text-xs font-semibold">New</Text>
            </View>
          )}
          {discountPercentage > 0 && (
            <View className="bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                -{discountPercentage}%
              </Text>
            </View>
          )}
        </View>

        {/* Wishlist Button */}
        {onWishlistPress && (
          <TouchableOpacity
            onPress={() => onWishlistPress(product)}
            className="absolute top-3 right-3 bg-white/80 p-2 rounded-full"
          >
            <Ionicons
              name={isWishlisted ? 'heart' : 'heart-outline'}
              size={18}
              color={isWishlisted ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        )}

        {/* Stock Status */}
        {!product.inStock && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <Text className="text-white font-semibold">Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Brand & Rating */}
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-500 text-xs uppercase font-medium">
            {product.brand}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={12} color="#FFA500" />
            <Text className="text-gray-600 text-xs ml-1">
              {product.rating} ({product.reviewCount})
            </Text>
          </View>
        </View>

        {/* Product Name */}
        <Text
          className="text-gray-900 font-semibold text-sm mb-2"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Colors */}
        <View className="flex-row mb-3">
          {product.colors.slice(0, 3).map((color, index) => (
            <View
              key={index}
              className="w-4 h-4 rounded-full mr-1 border border-gray-200"
              style={{
                backgroundColor: color.toLowerCase() === 'white' ? '#FFFFFF' :
                               color.toLowerCase() === 'black' ? '#000000' :
                               color.toLowerCase() === 'red' ? '#EF4444' :
                               color.toLowerCase() === 'blue' ? '#3B82F6' :
                               color.toLowerCase() === 'green' ? '#10B981' :
                               '#9CA3AF'
              }}
            />
          ))}
          {product.colors.length > 3 && (
            <Text className="text-gray-500 text-xs">
              +{product.colors.length - 3}
            </Text>
          )}
        </View>

        {/* Price */}
        <View className="flex-row items-center">
          <Text className="text-primary font-bold text-lg">
            ${product.price}
          </Text>
          {product.originalPrice && (
            <Text className="text-gray-400 text-sm ml-2 line-through">
              ${product.originalPrice}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;