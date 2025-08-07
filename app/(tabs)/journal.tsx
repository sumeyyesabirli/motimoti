// app/(tabs)/journal.tsx
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text } from 'react-native';
import { JournalCard } from '../../components/JournalCard';
import { colors } from '../../constants/colors';

const journalData = [
  { id: '1', date: '6 Ağustos', mood: '😄', note: 'Harika bir gündü!' },
  { id: '2', date: '5 Ağustos', mood: '😊', note: 'Arkadaşlarla kahve içtik.' },
  { id: '3', date: '4 Ağustos', mood: '😐', note: 'Yoğun bir iş günüydü.' },
];

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={journalData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JournalCard {...item} />}
        ListHeaderComponent={
          <Text style={styles.title}>Günlüğüm</Text>
        }
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
    color: colors.text,
    marginBottom: 16,
  },
});
