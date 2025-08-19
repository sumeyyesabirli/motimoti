import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

interface KeyboardAwareProps {
  children: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  extraScrollHeight?: number;
}

export default function KeyboardAware({
  children,
  contentContainerStyle,
  extraScrollHeight = 24,
}: KeyboardAwareProps) {
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={extraScrollHeight}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      enableAutomaticScroll={Platform.OS === 'ios'}
    >
      {children}
    </KeyboardAwareScrollView>
  );
}


