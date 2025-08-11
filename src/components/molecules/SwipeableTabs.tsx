import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';

interface TabOption {
  key: string;
  label: string;
}

interface SwipeableTabsProps {
  options: TabOption[];
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}

const { width: screenWidth } = Dimensions.get('window');

export function SwipeableTabs({ options, value, onChange, children }: SwipeableTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const index = options.findIndex(opt => opt.key === value);
    if (index !== -1) {
      setActiveIndex(index);
      Animated.spring(translateX, {
        toValue: -index * screenWidth,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    }
  }, [value, options]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        const swipeThreshold = screenWidth * 0.25;
        
        if (gestureState.dx > swipeThreshold && activeIndex > 0) {
          // Swipe right - go to previous tab
          const newIndex = activeIndex - 1;
          onChange(options[newIndex].key);
        } else if (gestureState.dx < -swipeThreshold && activeIndex < options.length - 1) {
          // Swipe left - go to next tab
          const newIndex = activeIndex + 1;
          onChange(options[newIndex].key);
        }
      },
    })
  ).current;

  return (
    <View className="flex-1">
      {/* Tab Headers */}
      <View className="flex-row bg-surface mb-4 p-1">
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.key}
            onPress={() => onChange(option.key)}
            className={`flex-1 py-2 px-3 rounded-md ${
              value === option.key ? 'bg-primary' : ''
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                value === option.key ? 'text-white' : 'text-muted'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Swipeable Content */}
      <View className="flex-1" {...panResponder.panHandlers}>
        <Animated.View
          style={{
            flexDirection: 'row',
            width: screenWidth * options.length,
            transform: [{ translateX }],
          }}
        >
          {React.Children.map(children, (child, index) => (
            <View key={index} style={{ width: screenWidth }}>
              {child}
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
