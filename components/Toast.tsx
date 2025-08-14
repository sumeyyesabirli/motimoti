// components/Toast.tsx
import { CheckCircle, WarningCircle } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFeedback } from '../context/FeedbackContext';
import { useTheme } from '../context/ThemeContext';

export const Toast = () => {
  const { feedback } = useFeedback();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  if (!feedback) return null;

  const isSuccess = feedback.type === 'success';
  const backgroundColor = isSuccess ? colors.primaryButton : colors.header;
  const Icon = isSuccess ? CheckCircle : WarningCircle;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(150)}
      style={[styles.backdrop]}
    >
      <Animated.View
        entering={ZoomIn.duration(200)}
        exiting={ZoomOut.duration(180)}
        style={[
          styles.popup,
          { backgroundColor: colors.card, borderColor: isSuccess ? colors.primaryButton : colors.header },
        ]}
      >
        <Icon size={24} color={isSuccess ? colors.primaryButton : colors.header} weight="fill" />
        <Text style={[styles.popupText, { color: colors.textDark }]}>{feedback.message}</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 9999,
  },
  popup: {
    width: '85%',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  popupText: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    marginLeft: 12,
    flex: 1,
  },
});


