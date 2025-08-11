import React, { useCallback } from 'react';
import { TextInput, TextInputProps } from './TextInput';
import { formatCurrency } from '../../utils/format';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value?: number; // valor em centavos
  onChangeValue: (value: number) => void;
}

export function CurrencyInput({
  value,
  onChangeValue,
  ...props
}: CurrencyInputProps) {
  const parseCurrency = (text: string): number => {
    // Remove tudo exceto números
    const numbers = text.replace(/\D/g, '');
    return parseInt(numbers || '0', 10);
  };

  const handleChangeText = useCallback((text: string) => {
    const cents = parseCurrency(text);
    onChangeValue(cents);
  }, [onChangeValue]);

  const displayValue = value ? formatCurrency(value) : '';

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      iconLeft="cash-outline"
    />
  );
}