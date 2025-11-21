import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const baseStyle = 'rounded-xl flex-row items-center justify-center';
    const widthStyle = fullWidth ? 'w-full' : '';
    
    const sizeStyles = {
      small: 'px-4 py-2',
      medium: 'px-6 py-3',
      large: 'px-8 py-4',
    };

    const variantStyles = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      outline: 'bg-transparent border-2 border-primary',
      ghost: 'bg-transparent',
    };

    return `${baseStyle} ${widthStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${
      disabled ? 'opacity-50' : ''
    }`;
  };

  const getTextStyle = () => {
    const sizeStyles = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg',
    };

    const variantStyles = {
      primary: 'text-white font-semibold',
      secondary: 'text-white font-semibold',
      outline: 'text-primary font-semibold',
      ghost: 'text-gray-700 font-medium',
    };

    return `${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'ghost' ? '#FF6B35' : 'white'} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text className={getTextStyle()} style={textStyle}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;