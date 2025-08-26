// app/profile/edit.tsx
import { useRouter } from 'expo-router';
import { CaretDown, CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFeedback } from '../../context/FeedbackContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserProfile, updateUserProfile } from '../../services/users';

const zodiacSigns = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];

// BirthDate formatını dönüştür: YYYY-MM-DD -> DD.MM.YYYY (display için)
const formatBirthDateForDisplay = (birthDate) => {
  if (!birthDate) return { day: '', month: '', year: '' };
  
  // YYYY-MM-DD formatından DD.MM.YYYY'ye çevir
  if (birthDate.includes('-')) {
    const parts = birthDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return { day, month, year };
    }
  }
  
  // DD.MM.YYYY formatından parse et
  if (birthDate.includes('.')) {
    const parts = birthDate.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return { day, month, year };
    }
  }
  
  return { day: '', month: '', year: '' };
};

// BirthDate'i YYYY-MM-DD formatına çevir (API için)
const formatBirthDateForAPI = (day, month, year) => {
  if (!day || !month || !year) return null;
  
  // Ay ve gün için 0 ekle (01, 02, vs.)
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  
  return `${year}-${formattedMonth}-${formattedDay}`;
};

export default function EditProfileScreen() {
  const { colors } = useTheme();
  const { user, token } = useAuth();
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
      if (user && token) {
        try {
          const response = await getUserProfile(user.id);
          if (response.success) {
            const data = response.data;
            setUsername(data.username || '');
            setZodiac(data.zodiac || '');
            
            // BirthDate'i display formatına çevir
            if (data.birthDate) {
              const formattedDate = formatBirthDateForDisplay(data.birthDate);
              setBirthDate(formattedDate);
              console.log('📅 BirthDate format dönüşümü:', {
                original: data.birthDate,
                display: formattedDate
              });
            }
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
        }
      }
      setLoading(false);
    };
    loadUserData();
  }, [user, token]);

  const handleUpdate = async () => {
    if (!user || !token) return;
    if (!username || !birthDate.day || !birthDate.month || !birthDate.year || !zodiac) {
      showFeedback({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      // BirthDate'i API formatına çevir
      const apiBirthDate = formatBirthDateForAPI(birthDate.day, birthDate.month, birthDate.year);
      
      console.log('📅 BirthDate güncelleme:', {
        display: birthDate,
        api: apiBirthDate
      });
      
      await updateUserProfile(user.id, {
        username,
        birthDate: apiBirthDate,
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
        <Text style={styles.buttonText}>Güncelle</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <FlatList
              data={zodiacSigns}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.zodiacItem}
                  onPress={() => {
                    setZodiac(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.zodiacText}>{item}</Text>
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 20 },
  headerButton: { backgroundColor: colors.card, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAE5D9' },
  headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: colors.textDark },
  label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark, marginBottom: 8, marginLeft: 24, marginTop: 20 },
  input: { backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, marginHorizontal: 24, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  dateContainer: { flexDirection: 'row', gap: 12, marginHorizontal: 24, marginBottom: 16 },
  dateInput: { flex: 1 },
  pickerButton: { backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EAE5D9', marginHorizontal: 24 },
  pickerText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark },
  button: { backgroundColor: colors.primaryButton, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginHorizontal: 24, marginTop: 20 },
  buttonText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textLight },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.card, borderRadius: 16, padding: 20, width: '80%', maxHeight: '60%' },
  zodiacItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.textMuted + '20' },
  zodiacText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark, textAlign: 'center' },
});

