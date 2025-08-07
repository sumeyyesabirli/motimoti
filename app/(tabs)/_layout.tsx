// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BookOpen, House } from 'phosphor-react-native';
import React from 'react';
import { View } from 'react-native';
import { colors } from '../../constants/colors';

const TabBarIcon = ({ Icon, focused }) => (
  <View style={{
    backgroundColor: focused ? colors.primaryButton : 'transparent',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: focused ? -15 : 0 }],
    shadowColor: focused ? colors.primaryButton : 'transparent',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: focused ? 0.3 : 0,
    shadowRadius: 10,
    elevation: focused ? 15 : 0,
  }}>
    <Icon
      size={28}
      color={focused ? colors.textLight : colors.textMuted}
      weight={focused ? 'fill' : 'regular'}
    />
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          height: 80,
          borderRadius: 40,
          borderTopWidth: 0,
          backgroundColor: colors.card,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 20, // Android için ana gölge
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={House} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
