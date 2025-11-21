import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: string;
  inputStyle?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  containerStyle = '',
  inputStyle = '',
  secureTextEntry,
  ...props
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);

  const toggleSecureEntry = () => {
    setIsSecure(!isSecure);
  };

  return (
    <View className={`mb-4 ${containerStyle}`}>
      {label && (
        <Text className="text-gray-700 text-sm font-medium mb-2">
          {label}
        </Text>
      )}
      
      <View
        className={`flex-row items-center border rounded-xl px-4 py-3 bg-gray-50 ${
          isFocused ? 'border-primary bg-white' : 'border-gray-200'
        } ${error ? 'border-red-500' : ''}`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? '#FF6B35' : '#9CA3AF'}
            style={{ marginRight: 12 }}
          />
        )}
        
        <TextInput
          className={`flex-1 text-gray-900 text-base ${inputStyle}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        
        {secureTextEntry && (
          <TouchableOpacity onPress={toggleSecureEntry}>
            <Ionicons
              name={isSecure ? 'eye-off' : 'eye'}
              size={20}
              color="#9CA3AF"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? '#FF6B35' : '#9CA3AF'}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Text>
      )}
    </View>
  );
};

export default Input;