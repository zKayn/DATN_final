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

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading } = useAuthStore();
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again later');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#004E89', '#006BA6']}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="justify-center items-center px-6 pt-16 pb-8">
            <View className="bg-white/20 p-6 rounded-full mb-6">
              <Ionicons name="person-add-outline" size={48} color="white" />
            </View>
            
            <Text className="text-white text-3xl font-bold mb-2">
              Create Account
            </Text>
            <Text className="text-white/90 text-base text-center">
              Join us and start your fitness journey
            </Text>
          </View>

          {/* Form Container */}
          <View className="bg-white rounded-t-[32px] px-6 py-8 flex-1">
            {/* Registration Form */}
            <View>
              <View className="flex-row space-x-4 mb-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="firstName"
                    rules={{ required: 'First name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="First Name"
                        placeholder="John"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.firstName?.message}
                        icon="person-outline"
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="lastName"
                    rules={{ required: 'Last name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Last Name"
                        placeholder="Doe"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        error={errors.lastName?.message}
                      />
                    )}
                  />
                </View>
              </View>

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
                    placeholder="john.doe@example.com"
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
                    placeholder="Create a strong password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                    icon="lock-closed-outline"
                    secureTextEntry
                  />
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.confirmPassword?.message}
                    icon="shield-checkmark-outline"
                    secureTextEntry
                  />
                )}
              />

              <Button
                title="Create Account"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
                fullWidth
                size="large"
              />
            </View>

            {/* Terms */}
            <Text className="text-gray-500 text-xs text-center mt-4 leading-5">
              By creating an account, you agree to our{' '}
              <Text className="text-secondary underline">Terms of Service</Text>
              {' '}and{' '}
              <Text className="text-secondary underline">Privacy Policy</Text>
            </Text>

            {/* Sign In Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-secondary font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;