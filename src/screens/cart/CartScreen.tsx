// SportShopApp/src/screens/cart/CartScreen.tsx

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useCartStore } from '../../store/cartStore';

const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    isLoading,
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      await fetchCart();
    } catch (error) {
      console.error('Load cart error:', error);
    }
  };

  // 🔥 TÍNH TOÁN GIÁ TRỰC TIẾP BẰNG useMemo
  const cartCalculations = useMemo(() => {
    console.log('💰 Calculating cart totals...');
    
    let totalItems = 0;
    let subtotal = 0;

    items.forEach((item: any) => {
      const price = Number(item?.price || item?.product?.price || 0);
      const quantity = Number(item?.quantity || 0);
      
      totalItems += quantity;
      subtotal += price * quantity;

      console.log('   Item:', {
        name: item?.product?.name,
        price,
        quantity,
        itemTotal: price * quantity,
      });
    });

    const shipping = subtotal > 50 ? 0 : 5;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;

    console.log('✅ Cart Totals:', {
      totalItems,
      subtotal,
      shipping,
      tax,
      total,
    });

    return { totalItems, subtotal, shipping, tax, total };
  }, [items]);

  const handleCheckout = () => {
  if (items.length === 0) {
    Alert.alert('Cart Empty', 'Please add items to your cart first');
    return;
  }

  // Navigate to Checkout
  navigation.navigate('Checkout');
};

  const handleRemoveItem = (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeFromCart(itemId),
      },
    ]);
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Are you sure you want to remove all items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: clearCart,
      },
    ]);
  };

  const renderCartItem = (item: any) => {
    const product = item?.product || {};
    const productName = product.name || 'Unknown Product';
    const brandName = typeof product.brand === 'object' 
      ? product.brand?.name || 'Unknown Brand'
      : product.brand || 'Unknown Brand';
    
    // 🔥 Ưu tiên lấy giá từ product.price
    const price = Number(item?.price || product?.price || 0);
    const quantity = Number(item?.quantity || 0);
    const imageUrl = product.images?.[0]?.url || product.images?.[0];

    return (
      <View
        key={item.id}
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          flexDirection: 'row',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Product Image */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 96, height: 96, borderRadius: 12 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
          </View>
        )}

        {/* Product Info */}
        <View style={{ flex: 1, marginLeft: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#111827',
                flex: 1,
                paddingRight: 8,
              }}
              numberOfLines={2}
            >
              {productName}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={{ padding: 4 }}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            {brandName}
          </Text>

          {/* Size & Color */}
          {(item.size || item.color) && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              {item.size && (
                <View
                  style={{
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    marginRight: 8,
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
          )}

          {/* Price & Quantity */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B35' }}>
              ${(price * quantity).toFixed(2)}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, quantity - 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="remove" size={16} color="#374151" />
              </TouchableOpacity>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#111827',
                  marginHorizontal: 12,
                }}
              >
                {quantity}
              </Text>

              <TouchableOpacity
                onPress={() => updateQuantity(item.id, quantity + 1)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="add" size={16} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
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
        <Ionicons name="bag-outline" size={64} color="#9CA3AF" />
      </View>

      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8 }}>
        Your Cart is Empty
      </Text>
      <Text
        style={{
          fontSize: 16,
          color: '#6B7280',
          textAlign: 'center',
          marginBottom: 32,
        }}
      >
        Looks like you haven't added anything to your cart yet
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

  const renderOrderSummary = () => {
    const { totalItems, subtotal, shipping, tax, total } = cartCalculations;

    return (
      <View
        style={{
          backgroundColor: '#F9FAFB',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
          Order Summary
        </Text>

        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#6B7280' }}>Subtotal ({totalItems} items)</Text>
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

        {shipping > 0 && subtotal < 50 && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: '#EFF6FF',
              padding: 12,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={{ fontSize: 12, color: '#1E40AF', marginLeft: 8, flex: 1 }}>
              Add ${(50 - subtotal).toFixed(2)} more to get FREE shipping!
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={{ marginTop: 16, color: '#6B7280' }}>Loading cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Shopping Cart</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={{ color: '#EF4444', fontWeight: '600' }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map(renderCartItem)}
            {renderOrderSummary()}
            <View style={{ height: 80 }} />
          </ScrollView>

          {/* Checkout Button */}
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
                onPress={handleCheckout}
                style={{
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginRight: 8,
                  }}
                >
                  Proceed to Checkout
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default CartScreen;