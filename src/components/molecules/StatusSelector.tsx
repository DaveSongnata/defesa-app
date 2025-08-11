import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { PurchaseStatus } from '../../models/types';

interface StatusOption {
  key: PurchaseStatus;
  label: string;
}

interface StatusSelectorProps {
  value: PurchaseStatus;
  onChange: (value: PurchaseStatus) => void;
  error?: string;
}

export function StatusSelector({ value, onChange, error }: StatusSelectorProps) {
  const options: StatusOption[] = [
    { key: 'PAGO', label: 'Pago' },
    { key: 'ANDAMENTO', label: 'Andamento' },
    { key: 'ATRASADO', label: 'Atrasado' },
  ];

  return (
    <View>
      <View className="flex-row gap-2 justify-center px-8">
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`py-2 px-3 rounded-lg border ${
              value === option.key
                ? 'bg-primary border-primary'
                : 'bg-inputBg border-border'
            }`}
          >
            <Text
              className={`text-center text-xs font-medium ${
                value === option.key ? 'text-white' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && (
        <Text className="text-danger text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
