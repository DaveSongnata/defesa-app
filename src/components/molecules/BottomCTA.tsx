import React from 'react';
import { View, TouchableOpacity, Text, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomCTAProps extends ViewProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export function BottomCTA({ title, onPress, disabled, style, ...rest }: BottomCTAProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...rest}
      style={[
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: 24,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          backgroundColor: '#141414',
        },
        style,
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`bg-primary rounded-lg py-4 items-center ${disabled ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-semibold">{title}</Text>
      </TouchableOpacity>
    </View>
  );
}


