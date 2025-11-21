import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#FF6B35',
  text,
  fullScreen = false,
}) => {
  const containerStyle = fullScreen
    ? 'flex-1 justify-center items-center bg-white'
    : 'justify-center items-center py-8';

  return (
    <View className={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-gray-600 text-base mt-4 text-center">
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;