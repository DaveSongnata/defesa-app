import React, { useState } from 'react';
import { Platform, TouchableOpacity, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from './TextInput';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DatePickerFieldProps {
  label: string;
  value: Date | string;
  onChange: (date: Date) => void;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  minDate,
  maxDate,
  placeholder = 'Selecione uma data',
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);

  const dateValue = typeof value === 'string' ? new Date(value) : value;
  const isValidDate = !isNaN(dateValue.getTime());

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formattedDate = isValidDate
    ? format(dateValue, 'dd/MM/yyyy', { locale: ptBR })
    : '';

  if (Platform.OS === 'ios') {
    return (
      <View>
        <Text className="text-text text-sm font-medium mb-2">{label}</Text>
        <View className={`bg-inputBg rounded-lg border border-border ${error ? 'border-danger' : ''}`}>
          <DateTimePicker
            value={isValidDate ? dateValue : new Date()}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minDate}
            maximumDate={maxDate}
            locale="pt-BR"
            style={{ height: 120 }}
          />
        </View>
        {error && <Text className="text-danger text-xs mt-1">{error}</Text>}
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={() => setShow(true)}>
      <TextInput
        label={label}
        value={formattedDate}
        placeholder={placeholder}
        editable={false}
        error={error}
        iconRight="calendar-outline"
      />
      
      {show && (
        <DateTimePicker
          value={isValidDate ? dateValue : new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </TouchableOpacity>
  );
}