import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';

interface TextProps extends RNTextProps {
  children: React.ReactNode;
  className?: string;
}

export function Text({ children, style, ...props }: TextProps) {
  return (
    <RNText 
      {...props} 
      style={[styles.defaultText, style]}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: 'Poppins-Regular',
  },
});