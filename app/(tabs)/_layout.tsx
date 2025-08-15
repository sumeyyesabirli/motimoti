// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BookOpen, House, User, Users } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext'; // useTheme'i import et

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 65;
const TAB_COUNT = 4;
const TAB_WIDTH = width / TAB_COUNT;

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Tip tanımları
interface TabBarProps {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  descriptors: any;
  navigation: any;
}

// Özel Tab Bar Bileşeni
const CustomTabBar = ({ state, descriptors, navigation }: TabBarProps) => {
  const { colors } = useTheme(); // Renkleri temadan al
  const { bottom } = useSafeAreaInsets();
  const activeIndex = useSharedValue(state.index);
  const horizontalPosition = useSharedValue(state.index * TAB_WIDTH);


  // State değiştiğinde animasyonları güncelle
  React.useEffect(() => {
    activeIndex.value = state.index;
    horizontalPosition.value = withSpring(state.index * TAB_WIDTH, { 
      damping: 20, 
      stiffness: 100,
      mass: 1,
      velocity: 0
    });
  }, [state.index]);



  // Kavisin animasyonlu stili
  const animatedPathStyle = useAnimatedStyle(() => {
    const x = horizontalPosition.value;
    const tabCenter = x + TAB_WIDTH / 2;

    // SVG Path'i oluşturan dize. Bu, kavisin şeklini çizer.
    const path = `
      M0,0 
      L${tabCenter - 50},0 
      C${tabCenter - 25},0 ${tabCenter - 25},35 ${tabCenter},35 
      C${tabCenter + 25},35 ${tabCenter + 25},0 ${tabCenter + 50},0 
      L${width},0 
      L${width},${TAB_BAR_HEIGHT} 
      L0,${TAB_BAR_HEIGHT} 
      Z
    `;
    return { d: path } as any;
  });

  // Stilleri dinamik hale getir
  const styles = getStyles(colors);

  return (
    // Sistem tuşları için 'bottom' boşluğunu ekleyerek üst üste binmeyi engelliyoruz
    <View style={[styles.tabBarContainer, { height: TAB_BAR_HEIGHT + bottom, paddingBottom: bottom }]}>
      <Svg width={width} height={TAB_BAR_HEIGHT} style={StyleSheet.absoluteFillObject}>
        <AnimatedPath fill={colors.card} animatedProps={animatedPathStyle} />
      </Svg>

      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const Icon = index === 0 ? House : (index === 1 ? BookOpen : (index === 2 ? Users : User));
        
        // İkonun yukarı/aşağı hareket animasyonu
        const animatedIconStyle = useAnimatedStyle(() => {
          return {
            transform: [
              { translateY: withSpring(activeIndex.value === index ? -15 : 0, { 
                damping: 25, 
                stiffness: 200,
                mass: 0.8
              }) }
            ],
          };
        });

        const onPress = React.useCallback(() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            activeIndex.value = index;
            horizontalPosition.value = withSpring(index * TAB_WIDTH, { 
              damping: 20, 
              stiffness: 100,
              mass: 1
            });
          }
        }, [isFocused, navigation, route.key, route.name, index]);

        return (
          <Animated.View key={route.key} style={[styles.tabItem, animatedIconStyle]}>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
                             <Icon
                 size={28}
                 color={isFocused ? colors.primaryButton : colors.textMuted}
                 weight={isFocused ? 'fill' : 'regular'}
               />
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="community" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// Stil fonksiyonunu dosyanın dışına taşı
const getStyles = (colors: any) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
