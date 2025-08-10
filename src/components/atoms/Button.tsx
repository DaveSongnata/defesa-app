import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'danger' | 'secondary';
  loading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary active:bg-primaryDark';
      case 'danger':
        return 'bg-danger active:bg-red-700';
      case 'secondary':
        return 'bg-surface border border-border';
      default:
        return 'bg-primary';
    }
  };

  const getTextColor = () => {
    return variant === 'secondary' ? 'text-text' : 'text-white';
  };

  return (
    <TouchableOpacity
      className={`py-3 px-6 rounded-lg items-center justify-center min-h-[48px] ${getVariantStyles()} ${
        disabled || loading ? 'opacity-50' : ''
      } ${className || ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'secondary' ? '#FDFDFD' : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <Text className={`font-semibold text-base ${getTextColor()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}