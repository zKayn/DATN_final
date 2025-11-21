// SportShopApp/src/screens/profile/OrderDetailScreen.tsx
// ✅ UPDATED: Added Write Review button for DELIVERED orders

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import apiService from '../../services/api';

const OrderDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOrderById(orderId);
      if (response.success) {
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Load order detail error:', error);
      Alert.alert('Error', 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ ADD: Function to navigate to write review
  const handleWriteReview = (item: any) => {
    navigation.navigate('WriteReview', {
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images?.[0]?.url || item.product.images?.[0] || '',
      orderId: order.id,
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.cancelOrder(orderId);
              if (response.success) {
                Alert.alert('Success', 'Order cancelled successfully');
                loadOrderDetail();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel order');
            }
          },
        },
      ]
    );
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

  const parseShippingAddress = (addressString: string) => {
    try {
      return JSON.parse(addressString);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const shippingAddress = parseShippingAddress(order.shippingAddress);

  const renderHeader = () => (
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
        Order Details
      </Text>
    </View>
  );

  const renderOrderStatus = () => (
    <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 8 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Order Number</Text>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>
            {order.orderNumber}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: getStatusBgColor(order.status),
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: getStatusColor(order.status),
              textTransform: 'capitalize',
            }}
          >
            {order.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Order Date</Text>
          <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500' }}>
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>Payment Method</Text>
          <Text style={{ fontSize: 16, color: '#111827', fontWeight: '500', textTransform: 'uppercase' }}>
            {order.paymentMethod}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOrderItems = () => (
    <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Items ({order.items?.length || 0})
      </Text>

      {order.items?.map((item: any, index: number) => (
        <View
          key={item.id}
          style={{
            marginBottom: index === order.items.length - 1 ? 0 : 16,
            paddingBottom: index === order.items.length - 1 ? 0 : 16,
            borderBottomWidth: index === order.items.length - 1 ? 0 : 1,
            borderBottomColor: '#F3F4F6',
          }}
        >
          <View style={{ flexDirection: 'row' }}>
            {item.product?.images?.[0] ? (
              <Image
                source={{ uri: item.product.images[0]?.url || item.product.images[0] }}
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

            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: 4,
                }}
                numberOfLines={2}
              >
                {item.product?.name || 'Product'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                {item.size && (
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#374151' }}>Size: {item.size}</Text>
                  </View>
                )}
                {item.color && (
                  <View
                    style={{
                      backgroundColor: '#F3F4F6',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#374151' }}>Color: {item.color}</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }}>
                  ${Number(item.price).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>Qty: {item.quantity}</Text>
              </View>
            </View>
          </View>

          {/* ✅ ADD: Write Review Button for DELIVERED orders */}
          {order.status?.toLowerCase() === 'delivered' && (
            <TouchableOpacity
              onPress={() => handleWriteReview(item)}
              style={{
                marginTop: 12,
                backgroundColor: '#FFF7ED',
                borderWidth: 1,
                borderColor: '#FF6B35',
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="star-outline" size={18} color="#FF6B35" />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#FF6B35',
                  marginLeft: 8,
                }}
              >
                Write Review
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );

  const renderShippingAddress = () => {
    if (!shippingAddress) return null;

    return (
      <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
          Shipping Address
        </Text>

        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="person-outline" size={20} color="#6B7280" />
            <Text style={{ fontSize: 16, color: '#111827', marginLeft: 12 }}>
              {shippingAddress.fullName}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="call-outline" size={20} color="#6B7280" />
            <Text style={{ fontSize: 16, color: '#111827', marginLeft: 12 }}>
              {shippingAddress.phone}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="location-outline" size={20} color="#6B7280" />
            <Text style={{ fontSize: 16, color: '#111827', marginLeft: 12, flex: 1 }}>
              {shippingAddress.address}
              {shippingAddress.city && `, ${shippingAddress.city}`}
              {shippingAddress.postalCode && ` ${shippingAddress.postalCode}`}
              {shippingAddress.country && `, ${shippingAddress.country}`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPriceSummary = () => (
    <View style={{ backgroundColor: 'white', padding: 16, marginBottom: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Price Details
      </Text>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6B7280' }}>Subtotal</Text>
          <Text style={{ fontWeight: '600', color: '#111827' }}>
            ${Number(order.subtotal).toFixed(2)}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6B7280' }}>Shipping Fee</Text>
          <Text style={{ fontWeight: '600', color: '#111827' }}>
            ${Number(order.shippingFee).toFixed(2)}
          </Text>
        </View>

        {order.discount > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6B7280' }}>Discount</Text>
            <Text style={{ fontWeight: '600', color: '#10B981' }}>
              -${Number(order.discount).toFixed(2)}
            </Text>
          </View>
        )}

        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Total</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF6B35' }}>
            ${Number(order.total).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderOrderStatus()}
        {renderOrderItems()}
        {renderShippingAddress()}
        {renderPriceSummary()}

        {/* Cancel Button */}
        {order.status === 'PENDING' && (
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={handleCancelOrder}
              style={{
                backgroundColor: 'white',
                borderWidth: 2,
                borderColor: '#EF4444',
                borderRadius: 12,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
              <Text
                style={{
                  color: '#EF4444',
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginLeft: 8,
                }}
              >
                Cancel Order
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default OrderDetailScreen;