import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

interface PoppinsTextProps extends TextProps {
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
}

export const PoppinsText: React.FC<PoppinsTextProps> = ({ 
  style, 
  weight = 'regular', 
  ...props 
}) => {
  const fontFamily = {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semibold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  }[weight];

  return (
    <RNText
      {...props}
      style={[
        { fontFamily },
        style
      ]}
    />
  );
};

// Exportar como Text para substituir facilmente
export const Text = PoppinsText;