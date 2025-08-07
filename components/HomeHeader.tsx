// components/HomeHeader.tsx
import { Bell } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export const HomeHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View>
          <Text style={styles.greeting}>Merhaba Şekerim,</Text>
          <Text style={styles.date}>Bugün 7 Ağustos</Text>
        </View>
      </View>
      <Bell size={28} color={colors.text} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 50,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.card,
  },
  greeting: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: colors.textSecondary,
  },
  date: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: colors.text,
  },
});
