// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { BookOpen, House } from 'phosphor-react-native';
import React from 'react';
import { colors } from '../../constants/colors';

const TabBarIcon = ({ Icon, color, focused }) => (
  <Icon
    size={26}
    color={color}
    weight={focused ? 'fill' : 'regular'}
  />
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: '#E9ECEF',
          height: 90,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Poppins-SemiBold',
          fontSize: 12,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={House} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Günlüğüm',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon Icon={BookOpen} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
