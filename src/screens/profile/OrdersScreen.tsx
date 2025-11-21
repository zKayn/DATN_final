// SportShopApp/src/screens/profile/OrdersScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import apiService from '../../services/api';

const OrdersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrders();
      console.log('📦 Orders API Response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        const ordersData = response.data || [];
        console.log('📦 Orders count:', ordersData.length);
        
        if (ordersData.length > 0) {
          console.log('📦 First order sample:', JSON.stringify(ordersData[0], null, 2));
          console.log('💰 First order total field:', ordersData[0]?.total);
          console.log('💰 First order totalAmount field:', ordersData[0]?.totalAmount);
          console.log('💰 First order subtotal field:', ordersData[0]?.subtotal);
        }
        
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Load orders error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: '#F59E0B',
      processing: '#3B82F6',
      shipped: '#8B5CF6',
      delivered: '#10B981',
      cancelled: '#EF4444',
    };
    return colors[status?.toLowerCase()] || '#6B7280';
  };

  const getStatusBgColor = (status: string) => {
    const colors: any = {
      pending: '#FEF3C7',
      processing: '#DBEAFE',
      shipped: '#EDE9FE',
      delivered: '#D1FAE5',
      cancelled: '#FEE2E2',
    };
    return colors[status?.toLowerCase()] || '#F3F4F6';
  };

  const renderOrderItem = (order: any) => {
    const totalItems = order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
    
    // 💰 Try multiple fields for total (backend might use different field names)
    const orderTotal = order.total || order.totalAmount || order.subtotal || 0;
    
    console.log(`💰 Rendering order ${order.orderNumber}: total=${order.total}, totalAmount=${order.totalAmount}, final=${orderTotal}`);

    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 }}>
              Order #{order.orderNumber || order.id.slice(0, 8)}
            </Text>
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: getStatusBgColor(order.status),
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getStatusColor(order.status),
                textTransform: 'capitalize',
              }}
            >
              {order.status}
            </Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
            {totalItems} item{totalItems !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Total & Action */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
          }}
        >
          <View>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>
              Total Amount
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }}>
              ${Number(orderTotal).toFixed(2)}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: '#FF6B35', fontWeight: '600', marginRight: 4 }}>
              View Details
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#FF6B35" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
      <View
        style={{
          width: 128,
          height: 128,
          borderRadius: 64,
          backgroundColor: '#F3F4F6',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
      </View>

      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
        No Orders Yet
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
          paddingHorizontal: 32,
        }}
      >
        You haven't placed any orders yet. Start shopping now!
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={{
          backgroundColor: '#FF6B35',
          paddingHorizontal: 32,
          paddingVertical: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>
          Start Shopping
        </Text>
        <Ionicons name="arrow-forward" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading orders...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
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
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginLeft: 16 }}>
          My Orders
        </Text>
      </View>

      {orders.length === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FF6B35']}
              tintColor="#FF6B35"
            />
          }
        >
          {orders.map(renderOrderItem)}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default OrdersScreen;