// SportShopApp/src/navigation/AppNavigator.tsx
// ✅ UPDATED WITH REVIEW SCREENS

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/home/HomeScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductDetailScreen from '../screens/product/ProductDetailScreen';
import CartScreen from '../screens/cart/CartScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OrdersScreen from '../screens/profile/OrdersScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CheckoutScreen from '../screens/checkout/CheckoutScreen';
import OrderDetailScreen from '../screens/profile/OrderDetailScreen';
import MyReviewsScreen from '../screens/profile/MyReviewsScreen'; // ✅ NEW
import WriteReviewScreen from '../screens/profile/WriteReviewScreen'; // ✅ NEW

// Import store
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import socketService from '../services/socket';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const totalItems = useCartStore(state => state?.totalItems || 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return (
            <View style={{ position: 'relative' }}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'Cart' && totalItems > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#FF3B30',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Products" component={ProductListScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'white' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: 'white' },
    }}
  >
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen 
      name="ProductDetail" 
      component={ProductDetailScreen}
    />
    <Stack.Screen 
      name="Orders" 
      component={OrdersScreen}
    />
    <Stack.Screen 
      name="Search" 
      component={SearchScreen}
    />
    <Stack.Screen 
      name="Checkout" 
      component={CheckoutScreen}
    />
    <Stack.Screen 
      name="OrderDetail" 
      component={OrderDetailScreen}
    />
    {/* ✅ REVIEW SCREENS */}
    <Stack.Screen 
      name="MyReviews" 
      component={MyReviewsScreen}
      options={{ title: 'My Reviews' }}
    />
    <Stack.Screen 
      name="WriteReview" 
      component={WriteReviewScreen}
      options={{ title: 'Write Review' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore(state => state?.isAuthenticated || false);
  const user = useAuthStore(state => state?.user);

  // ========================================
  // 🔌 SOCKET.IO CONNECTION & LISTENERS
  // ========================================
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log('🔌 Connecting to socket...');
      
      // Connect socket with user ID
      socketService.connect(user.id);

      // 📢 Listen for order status updates
      const handleOrderUpdate = (data: any) => {
        console.log('🔔 Order status updated:', data);
        
        // Show notification to user
        Alert.alert(
          '📦 Order Update',
          data.message || `Your order #${data.orderNumber} status changed to ${data.status}`,
          [
            {
              text: 'View Order',
              onPress: () => {
                // Navigate to order detail
                console.log('Navigate to order:', data.orderId);
              },
            },
            {
              text: 'OK',
              style: 'cancel',
            },
          ]
        );
      };

      // 📢 Listen for general notifications
      const handleNotification = (data: any) => {
        console.log('🔔 Notification received:', data);
        
        Alert.alert(
          data.title || 'Notification',
          data.message,
          [{ text: 'OK' }]
        );
      };

      // 📢 Listen for product updates (optional)
      const handleProductUpdate = (data: any) => {
        console.log('🔔 Product updated:', data);
        // Refresh product list or show notification
      };

      // 📢 Listen for stock alerts (optional)
      const handleStockUpdate = (data: any) => {
        console.log('🔔 Stock updated:', data);
        // Update product stock in UI
      };

      // ✅ NEW: Listen for review updates
      const handleReviewUpdate = (data: any) => {
        console.log('🔔 Review updated:', data);
        
        if (data.type === 'approved') {
          Alert.alert(
            '⭐ Review Approved',
            'Your review has been approved and published!',
            [{ text: 'View', onPress: () => console.log('View review') }]
          );
        } else if (data.type === 'replied') {
          Alert.alert(
            '💬 Store Replied',
            'The store has replied to your review!',
            [{ text: 'View', onPress: () => console.log('View review') }]
          );
        }
      };

      // Register event listeners
      socketService.on('order:updated', handleOrderUpdate);
      socketService.on('notification:new', handleNotification);
      socketService.on('product:updated', handleProductUpdate);
      socketService.on('stock:updated', handleStockUpdate);
      socketService.on('review:updated', handleReviewUpdate); // ✅ NEW

      // Cleanup on unmount or logout
      return () => {
        console.log('🔌 Disconnecting socket...');
        socketService.off('order:updated', handleOrderUpdate);
        socketService.off('notification:new', handleNotification);
        socketService.off('product:updated', handleProductUpdate);
        socketService.off('stock:updated', handleStockUpdate);
        socketService.off('review:updated', handleReviewUpdate); // ✅ NEW
        socketService.disconnect();
      };
    }
  }, [isAuthenticated, user?.id]);

  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;