import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

type OnboardingProps = {
  visible: boolean;
  onDismiss: () => void;
};

export const Onboarding = ({ visible, onDismiss }: OnboardingProps) => {
  const animationRef = useRef<LottieView>(null);
  const { colors } = useTheme();

  if (!visible) return null;

  return (
    <View pointerEvents="auto" style={[styles.overlay, { backgroundColor: colors.background }] }>
      <Pressable style={styles.pressable} onPress={onDismiss}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.content}>
            <LottieView
              ref={animationRef}
              source={require('../Cute bear dancing(1).json')}
              autoPlay
              loop
              resizeMode="contain"
              style={styles.lottie}
            />
            <View style={styles.texts}>
              <Text style={[styles.title, { color: colors.textDark }]}>Motimoti'ye Hoş Geldin!</Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>Devam etmek için ekrana dokun</Text>
            </View>
          </View>
        </SafeAreaView>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  pressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safe: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  lottie: {
    width: '85%',
    height: '60%',
  },
  texts: {
    alignItems: 'center',
    marginTop: 12,
  },
  title: {
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 24,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
  },
});

export default Onboarding;


