// context/FeedbackContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  
  // Özel onay diyaloğu durumu
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<{
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'success' | 'error' | 'info';
  } | null>(null);
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

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
      setConfirmOptions(options);
      setConfirmVisible(true);
      setConfirmResolver(() => resolve);
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

      {/* Özel onay overlay'i */}
      {confirmVisible && confirmOptions && (
        <View style={styles.confirmOverlay}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card }] }>
            {!!confirmOptions.title && (
              <Text style={[styles.confirmTitle, { color: colors.textDark }]}>
                {confirmOptions.title}
              </Text>
            )}
            <Text style={[styles.confirmMessage, { color: colors.textDark }]}>
              {confirmOptions.message}
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisible(false);
                  setConfirmOptions(null);
                  if (confirmResolver) confirmResolver(false);
                }}
                style={styles.confirmButtonSecondary}
              >
                <Text style={[styles.confirmButtonTextSecondary, { color: colors.textMuted }]}>
                  {confirmOptions.cancelText || 'İPTAL'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setConfirmVisible(false);
                  setConfirmOptions(null);
                  if (confirmResolver) confirmResolver(true);
                }}
                style={[styles.confirmButtonPrimary, { backgroundColor: colors.header }]}
              >
                <Text style={[styles.confirmButtonTextPrimary, { color: colors.textLight }]}>
                  {confirmOptions.confirmText || 'ONAYLA'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  confirmOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  confirmCard: {
    width: '90%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  confirmTitle: {
    fontFamily: 'Nunito-Bold',
    fontSize: 18,
    marginBottom: 8,
  },
  confirmMessage: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  confirmButtonPrimary: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  confirmButtonTextSecondary: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
  },
  confirmButtonTextPrimary: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
  },
});

export const useFeedback = () => useContext(FeedbackContext);


