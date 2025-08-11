import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Option<T> {
  key: T;
  label: string;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: 'segmented' | 'tabs';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = 'segmented',
}: SegmentedControlProps<T>) {
  if (variant === 'tabs') {
    return (
      <View className="flex-row border-b border-border justify-between">
        {options.map((option) => {
          const isSelected = option.key === value;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => onChange(option.key)}
              className={`flex-1 pb-2 ${isSelected ? 'border-b-2 border-primary' : 'border-b-2 border-transparent'}`}
            >
              <Text className={`text-center text-xs font-poppins-medium ${isSelected ? 'text-primary' : 'text-muted'}`}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  return (
    <View className="flex-row bg-surface rounded-lg p-1 border border-border">
      {options.map((option) => {
        const isSelected = option.key === value;
        return (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`flex-1 py-2 px-4 rounded-md ${isSelected ? 'border border-primary' : ''}`}
          >
            <Text className={`text-center text-xs font-poppins-medium ${isSelected ? 'text-primary' : 'text-muted'}`}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}