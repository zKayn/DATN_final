// SportShopApp/src/screens/profile/ProfileScreen.tsx
// FIXED VERSION - Using Zustand Store

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore'; // ✅ FIXED

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuthStore(); // ✅ FIXED - Using Zustand

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      screen: 'EditProfile',
    },
    {
      icon: 'location-outline',
      title: 'My Addresses',
      subtitle: 'Manage shipping addresses',
      screen: 'Addresses',
    },
    {
      icon: 'cube-outline',
      title: 'My Orders',
      subtitle: 'Track and manage your orders',
      screen: 'Orders',
    },
    // ✅ REVIEW ITEM
    {
      icon: 'star-outline',
      title: 'My Reviews',
      subtitle: 'View and manage your product reviews',
      screen: 'MyReviews',
      color: '#FFA500',
    },
    {
      icon: 'heart-outline',
      title: 'Wishlist',
      subtitle: 'Your favorite items',
      screen: 'Wishlist',
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      screen: 'Notifications',
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences and privacy',
      screen: 'Settings',
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will auto-redirect due to isAuthenticated change
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </Text>
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ''}`.trim()
                  : 'User'}
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile' as never)}
          >
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen as never)}
            >
              <View
                style={[
                  styles.menuIcon,
                  item.color && { backgroundColor: `${item.color}20` },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color || '#FF6B35'}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  editButton: {
    padding: 8,
  },
  menuContainer: {
    marginTop: 16,
    backgroundColor: 'white',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
    marginBottom: 32,
  },
});

export default ProfileScreen;