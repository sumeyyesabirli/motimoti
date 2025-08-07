// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BookOpen, House } from 'phosphor-react-native';
import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/colors';

const { width } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 65;
const TAB_WIDTH = width / 2;
const DIP_WIDTH = 80; // Kavisin genişliği
const DIP_HEIGHT = 40; // Kavisin derinliği

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Özel Tab Bar Bileşeni
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { bottom } = useSafeAreaInsets(); // Telefonun altındaki sistem boşluğunu al
  const activeIndex = useSharedValue(state.index);
  const indicatorPosition = useSharedValue(state.index * TAB_WIDTH);

  // İkonun animasyonlu stili
  const animatedIconStyle = (index) => useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(activeIndex.value === index ? -DIP_HEIGHT / 1.5 : 0) }
      ],
    };
  });

  // Kavisin animasyonlu stili
  const animatedPathStyle = useAnimatedStyle(() => {
    const x = indicatorPosition.value;
    const halfTab = TAB_WIDTH / 2;
    const controlPoint = x + halfTab;

    const start = `M0 0`;
    const left = `L${controlPoint - DIP_WIDTH} 0`;
    const curve = `C${controlPoint - 50},0 ${controlPoint - 50},${DIP_HEIGHT + 10} ${controlPoint},${DIP_HEIGHT + 10}`;
    const curve2 = `C${controlPoint + 50},${DIP_HEIGHT + 10} ${controlPoint + 50},0 ${controlPoint + DIP_WIDTH},0`;
    const right = `L${width} 0 L${width} ${TAB_BAR_HEIGHT} L0 ${TAB_BAR_HEIGHT} Z`;

    return {
      d: `${start} ${left} ${curve} ${curve2} ${right}`,
    };
  });

  return (
    <View style={[styles.tabBarContainer, { height: TAB_BAR_HEIGHT + bottom }]}>
      <Svg width={width} height={TAB_BAR_HEIGHT} style={StyleSheet.absoluteFillObject}>
        <AnimatedPath fill={colors.card} style={animatedPathStyle} />
      </Svg>

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = index === 0 ? House : BookOpen;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
            activeIndex.value = index;
            indicatorPosition.value = withTiming(index * TAB_WIDTH);
          }
        };

        return (
          <Animated.View key={route.key} style={[styles.tabItem, animatedIconStyle(index)]}>
            <TouchableOpacity onPress={onPress} style={styles.touchable}>
              <Icon
                size={28}
                color={isFocused ? '#E07A5F' : '#8D99AE'}
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
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    shadowColor: '#3D405B',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 25,
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
