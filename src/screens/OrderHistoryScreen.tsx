// SportShopApp/src/screens/profile/OrderHistoryScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import socketService from '../services/socket';
import apiService from '../services/api';

interface OrderHistoryScreenProps {
  navigation: any;
}

export default function OrderHistoryScreen({ navigation }: OrderHistoryScreenProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  // 🔔 Socket listener for real-time updates
  useEffect(() => {
    const handleOrderUpdate = (data: any) => {
      console.log('🔔 Order status changed:', data);

      // Update order in list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === data.orderId
            ? { ...order, status: data.status }
            : order
        )
      );

      // Show notification
      Alert.alert(
        '📦 Order Updated',
        data.message || `Your order #${data.orderNumber} status changed to ${data.status}`,
        [{ text: 'Ok' }]
      );
    };

    socketService.on('order:updated', handleOrderUpdate);

    return () => {
      socketService.off('order:updated', handleOrderUpdate);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Load orders error:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '#FF9500';
      case 'PROCESSING':
        return '#007AFF';
      case 'SHIPPED':
        return '#5856D6';
      case 'DELIVERED':
        return '#34C759';
      case 'CANCELLED':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.orderInfo}>
        <Text style={styles.orderDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.itemCount}>
          {item.items?.length || 0} items
        </Text>
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${Number(item.total).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadOrders} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
});