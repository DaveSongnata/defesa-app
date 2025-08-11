import { Platform } from 'react-native';

// Configuração global de fontes para garantir Poppins em todo o app
export const defaultTextStyles = {
  fontFamily: 'Poppins-Regular',
};

// Estilos específicos para cada peso de fonte
export const fontStyles = {
  regular: {
    fontFamily: 'Poppins-Regular',
  },
  medium: {
    fontFamily: 'Poppins-Medium',
  },
  semibold: {
    fontFamily: 'Poppins-SemiBold',
  },
  bold: {
    fontFamily: 'Poppins-Bold',
  },
};

// Função helper para aplicar fonte correta
export const getFontStyle = (weight: 'regular' | 'medium' | 'semibold' | 'bold' = 'regular') => {
  return fontStyles[weight];
};