import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuthStore } from '../../store/authStore';

interface LoginForm {
  email: string;
  password: string;
}

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading } = useAuthStore();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#FF6B35', '#FF8E35']}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-1 justify-center items-center px-6 pt-20 pb-10">
            <View className="bg-white/20 p-6 rounded-full mb-8">
              <Ionicons name="basketball-outline" size={64} color="white" />
            </View>
            
            <Text className="text-white text-4xl font-bold mb-2">
              Welcome Back
            </Text>
            <Text className="text-white/90 text-lg text-center mb-8">
              Sign in to continue your sport journey
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-white rounded-t-[32px] px-6 py-8 min-h-[400px]">
            {/* Social Login Buttons */}
            <View className="mb-8">
              <Button
                title="Continue with Google"
                variant="outline"
                onPress={() => {}}
                fullWidth
                icon={
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color="#FF6B35"
                    style={{ marginRight: 12 }}
                  />
                }
              />
              
              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-4 text-gray-500">or</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>
            </View>

            {/* Login Form */}
            <View>
              <Controller
                control={control}
                name="email"
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email format',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Email"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.email?.message}
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    icon="lock-closed-outline"
                    secureTextEntry
                  />
                )}
              />

              <TouchableOpacity className="mb-6">
                <Text className="text-primary text-right font-medium">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <Button
                title="Sign In"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="large"
              />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center mt-8">
              <Text className="text-gray-600">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-primary font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;