// components/TabBarIcon.tsx
import { type IconProps } from 'phosphor-react-native';
import React from 'react';
import { colors } from '../constants/colors';

interface TabBarIconProps {
  color: string;
  focused: boolean;
  Icon: React.FC<IconProps>;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ Icon, color, focused }) => {
  return (
    <Icon
      size={28}
      color={focused ? colors.primary : color}
      weight={focused ? 'fill' : 'regular'}
    />
  );
};
