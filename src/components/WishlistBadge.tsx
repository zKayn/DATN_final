// SportShopApp/src/components/WishlistBadge.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import apiService from '../services/api';

interface WishlistBadgeProps {
  show?: boolean;
}

const WishlistBadge: React.FC<WishlistBadgeProps> = ({ show = true }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (show) {
      fetchCount();
    }
  }, [show]);

  const fetchCount = async () => {
    try {
      const count = await apiService.getWishlistCount();
      setCount(count);
    } catch (error) {
      console.error('❌ Fetch wishlist count error:', error);
    }
  };

  if (!show || count === 0) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default WishlistBadge;