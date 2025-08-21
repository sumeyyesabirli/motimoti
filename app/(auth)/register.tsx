// app/(auth)/register.tsx
import { Link, useRouter } from 'expo-router';
import { CaretDown, Eye, EyeSlash } from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFeedback } from '../../context/FeedbackContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const zodiacSigns = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];

// BirthDate'i YYYY-MM-DD formatına çevir (API için)
const formatBirthDateForAPI = (day, month, year) => {
  if (!day || !month || !year) return null;
  
  // Ay ve gün için 0 ekle (01, 02, vs.)
  const formattedMonth = month.padStart(2, '0');
  const formattedDay = day.padStart(2, '0');
  
  return `${year}-${formattedMonth}-${formattedDay}`;
};

export default function RegisterScreen() {
  const { showFeedback } = useFeedback();
  const { colors } = useTheme();
  const { register } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSignUp = async () => {
    if (!email || !password || !username || !birthDate.day || !birthDate.month || !birthDate.year || !zodiac) {
      showFeedback({ message: 'Lütfen tüm alanları doldurun.', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      // BirthDate'i API formatına çevir
      const apiBirthDate = formatBirthDateForAPI(birthDate.day, birthDate.month, birthDate.year);
      
      console.log('📅 Register BirthDate format dönüşümü:', {
        display: birthDate,
        api: apiBirthDate
      });
      
      const userData = {
        email,
        password,
        username,
        birthDate: apiBirthDate, // YYYY-MM-DD formatı
        zodiac,
      };
      
      await register(userData);
      showFeedback({ message: 'Başarıyla kayıt oldun!', type: 'success' });
      router.replace('/(tabs)');
    } catch (error: any) {
      showFeedback({ message: 'Kayıt sırasında bir hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Aramıza Katıl</Text>
        <Text style={styles.subtitle}>Yeni bir serüvene başla.</Text>

        <TextInput style={styles.input} placeholder="Kullanıcı Adı" value={username} onChangeText={setUsername} />
        <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.passwordContainer}>
          <TextInput style={styles.textInput} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeSlash size={24} color={colors.textMuted} /> : <Eye size={24} color={colors.textMuted} />}
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Doğum Tarihin</Text>
        <View style={styles.dateContainer}>
          <TextInput style={[styles.boxInput, styles.dateInput]} placeholder="Gün" value={birthDate.day} onChangeText={(text) => setBirthDate({ ...birthDate, day: text })} keyboardType="number-pad" maxLength={2} />
          <TextInput style={[styles.boxInput, styles.dateInput]} placeholder="Ay" value={birthDate.month} onChangeText={(text) => setBirthDate({ ...birthDate, month: text })} keyboardType="number-pad" maxLength={2} />
          <TextInput style={[styles.boxInput, styles.dateInput, { flex: 2 }]} placeholder="Yıl" value={birthDate.year} onChangeText={(text) => setBirthDate({ ...birthDate, year: text })} keyboardType="number-pad" maxLength={4} />
        </View>

        <Text style={styles.label}>Burcun</Text>
        <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.pickerText}>{zodiac || 'Burcunu Seç'}</Text>
          <CaretDown size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten bir hesabın var mı? </Text>
          <Link href="/(auth)" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Giriş Yap</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

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
  title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.textDark, textAlign: 'center', marginTop: 80 },
  subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 16, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  passwordContainer: { position: 'relative', marginBottom: 16 },
  textInput: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  eyeIcon: { position: 'absolute', right: 20, top: 15 },
  label: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textDark, marginBottom: 8 },
  dateContainer: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateInput: { flex: 1 },
  boxInput: { backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
  pickerButton: { backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EAE5D9' },
  pickerText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark },
  button: { backgroundColor: colors.primaryButton, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
  buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted },
  linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: colors.card, borderRadius: 16, padding: 20, width: '80%', maxHeight: '60%' },
  zodiacItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: colors.textMuted + '20' },
  zodiacText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark, textAlign: 'center' },
});

