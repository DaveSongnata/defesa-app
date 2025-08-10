import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  iconLeft?: keyof typeof Ionicons.glyphMap;
  iconRight?: keyof typeof Ionicons.glyphMap;
  onIconRightPress?: () => void;
}

export function TextInput({
  label,
  error,
  iconLeft,
  iconRight,
  onIconRightPress,
  className,
  ...props
}: TextInputProps) {
  return (
    <View className="mb-6">
      {label && (
        <Text className="text-gray-700 text-sm font-poppins-medium mb-2">{label}</Text>
      )}
      
      <View className={`bg-gray-50 rounded-lg border-b-2 border-gray-200 flex-row items-center px-4 ${error ? 'border-danger' : ''}`}>
        {iconLeft && (
          <View className="mr-3">
            <Ionicons name={iconLeft} size={20} color="#6B7280" />
          </View>
        )}
        
        <RNTextInput
          className={`flex-1 py-4 text-gray-900 font-poppins ${className || ''}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        
        {iconRight && (
          <TouchableOpacity onPress={onIconRightPress} disabled={!onIconRightPress}>
            <Ionicons name={iconRight} size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-danger text-xs mt-1 font-poppins">{error}</Text>
      )}
    </View>
  );
}