// SportShopApp/src/screens/checkout/CheckoutScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import apiService from '../../services/api';

const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('standard'); // 🔥 ADD THIS

  // Shipping Info
  const [shippingInfo, setShippingInfo] = useState({
    fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    phone: user?.phone || '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  // Calculate totals
  const subtotal = items.reduce((sum, item) => {
    const price = Number(item?.price || item?.product?.price || 0);
    const quantity = Number(item?.quantity || 0);
    return sum + price * quantity;
  }, 0);

  // 🔥 Shipping fee based on method
  const getShippingFee = () => {
    if (shippingMethod === 'express') return 15;
    if (shippingMethod === 'standard') return subtotal > 50 ? 0 : 5;
    return 5;
  };

  const shipping = getShippingFee();
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
  // Validate shipping info
  if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
    Alert.alert('Missing Information', 'Please fill in all shipping details');
    return;
  }

  try {
    setIsProcessing(true);

    // 🔥 FIX: Stringify shippingAddress
    const shippingAddressString = JSON.stringify({
      fullName: shippingInfo.fullName,
      phone: shippingInfo.phone,
      address: shippingInfo.address,
      city: shippingInfo.city,
      country: shippingInfo.country,
      postalCode: shippingInfo.postalCode,
    });

    const orderData = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price || item.product?.price || 0),
        size: item.size,
        color: item.color,
      })),
      shippingAddress: shippingAddressString, // 🔥 CHANGED: Now it's a string
      paymentMethod,
      shippingMethod,
      subtotal,
      shippingFee: shipping,
      tax,
      totalAmount: total,
    };

    console.log('📦 Creating order:', orderData);

    const response = await apiService.createOrder(orderData);

    if (response.success) {
      console.log('✅ Order created:', response.data);

      // Clear cart
      await clearCart();

      // Show success
      Alert.alert(
        'Order Placed Successfully! 🎉',
        `Your order #${response.data?.orderNumber || 'XXXXX'} has been placed successfully.`,
        [
          {
            text: 'View Order',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
              navigation.navigate('Orders');
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    }
  } catch (error: any) {
    console.error('❌ Place order error:', error);
    Alert.alert('Error', error.response?.data?.message || 'Failed to place order');
  } finally {
    setIsProcessing(false);
  }
};

  const renderShippingForm = () => (
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Shipping Information
      </Text>

      <View style={{ gap: 12 }}>
        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Full Name *
          </Text>
          <TextInput
            value={shippingInfo.fullName}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, fullName: text })}
            placeholder="Enter your full name"
            style={{
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Phone Number *
          </Text>
          <TextInput
            value={shippingInfo.phone}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, phone: text })}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            style={{
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Address *
          </Text>
          <TextInput
            value={shippingInfo.address}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, address: text })}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#111827',
              textAlignVertical: 'top',
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              City
            </Text>
            <TextInput
              value={shippingInfo.city}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, city: text })}
              placeholder="City"
              style={{
                backgroundColor: '#F9FAFB',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#111827',
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
              Postal Code
            </Text>
            <TextInput
              value={shippingInfo.postalCode}
              onChangeText={(text) => setShippingInfo({ ...shippingInfo, postalCode: text })}
              placeholder="Postal"
              keyboardType="numeric"
              style={{
                backgroundColor: '#F9FAFB',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#111827',
              }}
            />
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Country
          </Text>
          <TextInput
            value={shippingInfo.country}
            onChangeText={(text) => setShippingInfo({ ...shippingInfo, country: text })}
            placeholder="Enter your country"
            style={{
              backgroundColor: '#F9FAFB',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>
      </View>
    </View>
  );

  // 🔥 NEW: Render Shipping Method
  const renderShippingMethod = () => (
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Shipping Method
      </Text>

      <View style={{ gap: 12 }}>
        {[
          {
            id: 'standard',
            title: 'Standard Shipping',
            subtitle: '3-5 business days',
            price: subtotal > 50 ? 0 : 5,
            icon: 'bicycle-outline',
          },
          {
            id: 'express',
            title: 'Express Shipping',
            subtitle: '1-2 business days',
            price: 15,
            icon: 'airplane-outline',
          },
        ].map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => setShippingMethod(method.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: shippingMethod === method.id ? '#FFF4ED' : '#F9FAFB',
              borderWidth: 2,
              borderColor: shippingMethod === method.id ? '#FF6B35' : '#E5E7EB',
              borderRadius: 12,
            }}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={shippingMethod === method.id ? '#FF6B35' : '#6B7280'}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: shippingMethod === method.id ? '#FF6B35' : '#374151',
                }}
              >
                {method.title}
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {method.subtitle}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: shippingMethod === method.id ? '#FF6B35' : '#374151',
                marginRight: 8,
              }}
            >
              {method.price === 0 ? 'FREE' : `$${method.price}`}
            </Text>
            {shippingMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Payment Method
      </Text>

      <View style={{ gap: 12 }}>
        {[
          { id: 'card', title: 'Credit/Debit Card', icon: 'card-outline' },
          { id: 'cod', title: 'Cash on Delivery', icon: 'cash-outline' },
        ].map((method) => (
          <TouchableOpacity
            key={method.id}
            onPress={() => setPaymentMethod(method.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: 16,
              backgroundColor: paymentMethod === method.id ? '#FFF4ED' : '#F9FAFB',
              borderWidth: 2,
              borderColor: paymentMethod === method.id ? '#FF6B35' : '#E5E7EB',
              borderRadius: 12,
            }}
          >
            <Ionicons
              name={method.icon as any}
              size={24}
              color={paymentMethod === method.id ? '#FF6B35' : '#6B7280'}
            />
            <Text
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: '600',
                color: paymentMethod === method.id ? '#FF6B35' : '#374151',
                marginLeft: 12,
              }}
            >
              {method.title}
            </Text>
            {paymentMethod === method.id && (
              <Ionicons name="checkmark-circle" size={24} color="#FF6B35" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderOrderSummary = () => (
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
        Order Summary
      </Text>

      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6B7280' }}>Subtotal</Text>
          <Text style={{ fontWeight: '600', color: '#111827' }}>${subtotal.toFixed(2)}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6B7280' }}>Shipping</Text>
          <Text style={{ fontWeight: '600', color: '#111827' }}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#6B7280' }}>Tax</Text>
          <Text style={{ fontWeight: '600', color: '#111827' }}>${tax.toFixed(2)}</Text>
        </View>

        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 4 }} />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827' }}>Total</Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FF6B35' }}>
            ${total.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );

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
          Checkout
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {renderShippingForm()}
        {renderShippingMethod()}
        {renderPaymentMethod()}
        {renderOrderSummary()}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View
        style={{
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <LinearGradient colors={['#FF6B35', '#FF8E35']} style={{ borderRadius: 12 }}>
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            style={{
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="white" />
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 8,
                  }}
                >
                  Place Order - ${total.toFixed(2)}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

export default CheckoutScreen;