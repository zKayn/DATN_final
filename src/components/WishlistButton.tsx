// SportShopApp/src/components/WishlistButton.tsx

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import apiService from '../services/api';

interface WishlistButtonProps {
  productId: string;
  size?: number;
  onToggle?: (inWishlist: boolean) => void;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  size = 24,
  onToggle,
}) => {
  const [inWishlist, setInWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await apiService.checkWishlist(productId);
      setInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error('❌ Check wishlist error:', error);
    }
  };

  const handlePress = async () => {
    try {
      setLoading(true);
      const result = await apiService.toggleWishlist(productId);
      const newState = result.data.inWishlist; // ✅ FIX: Store in variable first
      
      setInWishlist(newState);
      
      if (newState) { // ✅ FIX: Use newState instead of isInWishlist
        Alert.alert('Success', 'Added to wishlist');
      } else {
        Alert.alert('Success', 'Removed from wishlist');
      }

      onToggle?.(newState);
    } catch (error) {
      console.error('❌ Toggle wishlist error:', error);
      Alert.alert('Error', 'Failed to update wishlist');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TouchableOpacity style={styles.button} disabled>
        <ActivityIndicator size="small" color="#FF3B30" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Icon
        name={inWishlist ? 'favorite' : 'favorite-border'}
        size={size}
        color={inWishlist ? '#FF3B30' : '#666'}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default WishlistButton;