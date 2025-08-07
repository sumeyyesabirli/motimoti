import React, { useEffect, useRef } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';

interface AnimatedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number;
  index?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  style,
  delay = 0,
  index = 0
}) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay + (index * 100));

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, rotateAnim, delay, index]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 32,
          padding: 24,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: Platform.OS === 'ios' ? 0.2 : 1,
          shadowRadius: 20,
          elevation: 15,
        },
        style,
        {
          opacity: opacityAnim,
          transform: [
            { scale: scaleAnim },
            { rotate: spin },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
