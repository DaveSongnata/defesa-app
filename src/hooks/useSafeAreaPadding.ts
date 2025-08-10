import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSafeAreaPadding(extraBottom: number = 0) {
  const insets = useSafeAreaInsets();

  return {
    paddingTop: Math.max(insets.top, 0),
    paddingBottom: Math.max(insets.bottom, 0) + extraBottom,
  } as const;
}


