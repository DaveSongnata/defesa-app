import { useRef } from 'react';
import { PanResponder } from 'react-native';

interface UseSwipeGestureProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 50,
}: UseSwipeGestureProps) {
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activate only for horizontal swipes
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && 
               Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > minSwipeDistance && onSwipeRight) {
          onSwipeRight();
        } else if (gestureState.dx < -minSwipeDistance && onSwipeLeft) {
          onSwipeLeft();
        }
      },
    })
  ).current;

  return panResponder.panHandlers;
}
