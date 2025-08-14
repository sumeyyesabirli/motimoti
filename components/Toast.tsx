// components/Toast.tsx
import { MotiView } from 'moti';
import { CheckCircle, WarningCircle } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
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
    <MotiView
      from={{ translateY: -150, opacity: 0 }}
      animate={{ translateY: insets.top + 10, opacity: 1 }}
      exit={{ translateY: -150, opacity: 0 }}
      transition={{ type: 'timing', duration: 400 }}
      style={[styles.container, { backgroundColor }]}
    >
      <Icon size={24} color={colors.textLight} weight="fill" />
      <Text style={styles.text}>{feedback.message}</Text>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 9999,
  },
  text: {
    fontFamily: 'Nunito-Bold',
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
});


