// context/FeedbackContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from './ThemeContext';

interface Feedback {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FeedbackContextType {
  feedback: Feedback | null;
  showFeedback: (feedback: Feedback) => void;
  showConfirm: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'success' | 'error' | 'info';
  }) => Promise<boolean>;
}

export const FeedbackContext = createContext<FeedbackContextType>({
  feedback: null,
  showFeedback: () => {},
  showConfirm: async () => false,
});

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const { colors } = useTheme();

  const showFeedback = useCallback((newFeedback: Feedback) => {
    setFeedback(newFeedback);
    
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Auto hide after 1.5 seconds
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setFeedback(null);
      });
    }, 1500);
  }, [fadeAnim]);

  const showConfirm: FeedbackContextType['showConfirm'] = useCallback((options) => {
    console.log('🔍 showConfirm çağrıldı:', options);
    
    return new Promise<boolean>((resolve) => {
      // Basit Alert.alert kullan
      const { Alert } = require('react-native');
      Alert.alert(
        options.title || 'Onay',
        options.message,
        [
          {
            text: options.cancelText || 'İptal',
            style: 'cancel',
            onPress: () => resolve(false)
          },
          {
            text: options.confirmText || 'Onayla',
            style: 'destructive',
            onPress: () => resolve(true)
          }
        ]
      );
    });
  }, []);

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { backgroundColor: colors.primaryButton, borderLeftColor: colors.primaryButton };
      case 'error':
        return { backgroundColor: colors.header, borderLeftColor: colors.header };
      case 'info':
        return { backgroundColor: colors.primaryButton, borderLeftColor: colors.primaryButton };
      default:
        return { backgroundColor: '#757575', borderLeftColor: '#424242' };
    }
  };

  return (
    <FeedbackContext.Provider value={{ feedback, showFeedback, showConfirm }}>
      {children}
      
      {feedback && (
        <Animated.View 
          style={[
            styles.toast,
            getToastStyle(feedback.type),
            { opacity: fadeAnim }
          ]}
        >
          <Text style={styles.message}>{feedback.message}</Text>
        </Animated.View>
      )}
    </FeedbackContext.Provider>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10,
    zIndex: 9999,
  },
  message: {
    color: 'white',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});

export const useFeedback = () => useContext(FeedbackContext);


