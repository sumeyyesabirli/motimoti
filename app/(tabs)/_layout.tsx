// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BookOpen, House } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 80;
const TAB_WIDTH = width / 2; // 2 sekmemiz olduğu için

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const activeIndex = useSharedValue(state.index);

  // Kavisin yatay pozisyonunu tutan animasyonlu değer
  const indicatorPosition = useSharedValue(TAB_WIDTH * state.index);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  const createPath = () => {
    const halfTab = TAB_WIDTH / 2;
    const dipWidth = 60;
    const halfDip = dipWidth / 2;

    // SVG path'ini dinamik olarak oluştur
    return `M0,0 L${indicatorPosition.value - halfDip},0 C${indicatorPosition.value - halfDip + 10},0 ${indicatorPosition.value - halfDip + 10},35 ${indicatorPosition.value},35 C${indicatorPosition.value + halfDip - 10},35 ${indicatorPosition.value + halfDip - 10},0 ${indicatorPosition.value + halfDip},0 L${width},0 L${width},${TAB_BAR_HEIGHT} L0,${TAB_BAR_HEIGHT} Z`;
  };
  



  return (
    <View style={styles.tabBarContainer}>
      <Svg width={width} height={TAB_BAR_HEIGHT} style={StyleSheet.absoluteFillObject}>
        <Path 
          fill={colors.card} 
          d={`M0,0 L${width},0 L${width},${TAB_BAR_HEIGHT} L0,${TAB_BAR_HEIGHT} Z`} 
        />
      </Svg>

      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const Icon = index === 0 ? House : BookOpen;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            indicatorPosition.value = withTiming(TAB_WIDTH * index);
            activeIndex.value = index;
          }
        };

        const animatedIconStyle = useAnimatedStyle(() => {
            const translateY = withTiming(activeIndex.value === index ? -15 : 0);
            return {
                transform: [{ translateY }]
            }
        })

        return (
          <Animated.View key={route.key} style={[styles.tabItem, animatedIconStyle]}>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
              <Icon
                size={28}
                color={isFocused ? colors.header : colors.textMuted}
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
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    backgroundColor: 'transparent', // Arka planı SVG çizecek
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
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
