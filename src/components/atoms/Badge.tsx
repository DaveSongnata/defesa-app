import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  count: number;
  variant: 'success' | 'danger' | 'warning' | 'neutral';
  label?: string;
}

export function Badge({ count, variant, label }: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'bg-success';
      case 'danger':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'neutral':
        return 'bg-muted';
      default:
        return 'bg-muted';
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full ${getVariantStyles()}`}>
      <Text className="text-white text-xs font-semibold">
        {label ?? count}
      </Text>
    </View>
  );
}