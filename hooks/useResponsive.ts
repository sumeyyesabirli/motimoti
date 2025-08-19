import { Platform, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Design base dimensions (iPhone 12 Pro)
const baseWidth = 390;
const baseHeight = 844;

// Responsive scaling
export const scale = (size: number) => (screenWidth / baseWidth) * size;
export const verticalScale = (size: number) => (screenHeight / baseHeight) * size;
export const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Platform-specific values
export const platformSelect = <T>(ios: T, android: T): T => {
  return Platform.select({ ios, android }) || ios;
};

// Safe area helpers
export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    // Platform-specific safe area
    headerHeight: platformSelect(insets.top + 44, (StatusBar.currentHeight || 0) + 56),
    tabBarHeight: platformSelect(insets.bottom + 49, 56),
  };
};

// Screen dimensions
export const useResponsive = () => {
  return {
    width: screenWidth,
    height: screenHeight,
    isSmallDevice: screenWidth < 375,
    isMediumDevice: screenWidth >= 375 && screenWidth < 414,
    isLargeDevice: screenWidth >= 414,
    isTablet: screenWidth >= 768,
  };
};

// Responsive spacing
export const spacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// Responsive font sizes
export const fontSizes = {
  xs: moderateScale(10),
  sm: moderateScale(12),
  md: moderateScale(14),
  lg: moderateScale(16),
  xl: moderateScale(18),
  xxl: moderateScale(20),
  xxxl: moderateScale(24),
  title: moderateScale(28),
  largeTitle: moderateScale(32),
};

// Platform-specific shadows
export const getPlatformShadow = (elevation: number, color: string = '#000') => {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: color,
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.25,
      shadowRadius: elevation,
    };
  }
  
  return {
    elevation,
  };
};

// Responsive border radius
export const borderRadius = {
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  round: scale(50),
};
