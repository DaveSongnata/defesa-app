import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderWithBackProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  rightAction?: React.ReactNode;
}

export function HeaderWithBack({
  title,
  subtitle,
  onBack,
  rightAction,
}: HeaderWithBackProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="bg-background border-b border-border px-4 pb-4"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity
            onPress={onBack}
            className="mr-3 p-2 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FDFDFD" />
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-text text-lg font-semibold">
              {title}
            </Text>
            {subtitle && (
              <Text className="text-muted text-sm">
                {subtitle}
              </Text>
            )}
          </View>
        </View>
        
        {rightAction && (
          <View className="ml-3">
            {rightAction}
          </View>
        )}
      </View>
    </View>
  );
}