// components/HomeHeader.tsx
import { Bell } from 'phosphor-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export const HomeHeader = () => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.userInfo}>
        <Image 
          source={{ uri: 'https://placehold.co/60x60/836FFF/FFFFFF?text=S' }} 
          style={styles.avatar} 
        />
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
    paddingTop: 50, // SafeAreaView'den sonraki boşluk
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
  },
  greeting: {
    fontFamily: 'Poppins-Regular', // Font ailesi eklendi
    fontSize: 16,
    color: colors.textSecondary,
  },
  date: {
    fontFamily: 'Poppins-Bold', // Font ailesi eklendi
    fontSize: 20,
    color: colors.text,
  },
});
