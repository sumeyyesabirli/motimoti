// app/profile/edit.tsx
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { CaretDown, CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebaseConfig';

const zodiacSigns = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data: any = docSnap.data();
          setUsername(data.username || '');
          setZodiac(data.zodiac || '');
          if (data.birthDate) {
            const [day, month, year] = String(data.birthDate).split('.');
            setBirthDate({ day, month, year });
          }
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, [user]);

  const handleUpdate = async () => {
    if (!user) return;
    if (!username || !birthDate.day || !birthDate.month || !birthDate.year || !zodiac) {
      showFeedback({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        username,
        birthDate: `${birthDate.day}.${birthDate.month}.${birthDate.year}`,
        zodiac,
      });
      showFeedback({ message: 'Profilin güncellendi.', type: 'success' });
      router.back();
    } catch (error: any) {
      showFeedback({ message: 'Güncelleme sırasında bir sorun oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={colors.primaryButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <CaretLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <View style={{ width: 44 }} />
      </View>

      <Text style={styles.label}>Kullanıcı Adı</Text>
      <TextInput style={styles.input} placeholder="Kullanıcı Adı" value={username} onChangeText={setUsername} />

      <Text style={styles.label}>Doğum Tarihin</Text>
      <View style={styles.dateContainer}>
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Gün" value={birthDate.day} onChangeText={(text) => setBirthDate({ ...birthDate, day: text })} keyboardType="number-pad" maxLength={2} />
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Ay" value={birthDate.month} onChangeText={(text) => setBirthDate({ ...birthDate, month: text })} keyboardType="number-pad" maxLength={2} />
        <TextInput style={[styles.input, styles.dateInput, { flex: 2 }]} placeholder="Yıl" value={birthDate.year} onChangeText={(text) => setBirthDate({ ...birthDate, year: text })} keyboardType="number-pad" maxLength={4} />
      </View>

      <Text style={styles.label}>Burcun</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerText}>{zodiac || 'Burcunu Seç'}</Text>
        <CaretDown size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Kaydet</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={zodiacSigns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => { setZodiac(item); setModalVisible(false); }}>
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 30, paddingBottom: 20 },
  headerButton: { backgroundColor: colors.card, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAE5D9' },
  headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: colors.textDark },
  label: { fontFamily: 'Nunito-Bold', color: colors.textMuted, alignSelf: 'flex-start', marginLeft: 5, marginBottom: 5, marginTop: 15 },
  input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  dateContainer: { flexDirection: 'row', gap: 10 },
  dateInput: { flex: 1, textAlign: 'center', paddingHorizontal: 10 },
  pickerButton: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EAE5D9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pickerText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark },
  button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: colors.card, borderRadius: 20, padding: 20, width: '80%', maxHeight: '60%' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EAE5D9' },
  modalItemText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, textAlign: 'center', color: colors.textDark },
});

