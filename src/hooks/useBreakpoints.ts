import { useWindowDimensions } from 'react-native';

export function useBreakpoints() {
  const { width } = useWindowDimensions();

  const isPhone = width < 600;
  const isSmallPhone = width < 360;
  const isTablet = width >= 600;

  return { isPhone, isSmallPhone, isTablet, width } as const;
}


