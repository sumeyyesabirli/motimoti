// app/(tabs)/journal.tsx
import React from 'react';
import { FlatList, Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/colors';

const journalData = [
  { id: '1', date: '6 Ağustos 2025', mood: '😄', note: 'Harika bir gündü!' },
  { id: '2', date: '5 Ağustos 2025', mood: '😊', note: 'Arkadaşlarla kahve içtik.' },
];

interface JournalEntryProps {
  mood: string;
  date: string;
  note: string;
}



const JournalEntryCard: React.FC<JournalEntryProps> = ({ mood, date, note }) => (
  <View style={styles.card}>
    <Text style={styles.mood}>{mood}</Text>
    <View>
      <Text style={styles.date}>{date}</Text>
      <Text style={styles.note}>{note}</Text>
    </View>
  </View>
);

export default function JournalScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={journalData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JournalEntryCard {...item} />
        )}
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
  listContainer: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 120 },
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 40, color: colors.textDark, marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : 1,
    shadowRadius: 15,
    elevation: 8,
  },
  mood: { fontSize: 36, marginRight: 16 },
  date: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: colors.textMuted },
  note: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark, marginTop: 2 },
});