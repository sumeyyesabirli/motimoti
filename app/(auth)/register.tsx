// app/(auth)/register.tsx
import { Link } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { CaretDown } from 'phosphor-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { auth, db } from '../../firebaseConfig';

const zodiacSigns = ["Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak", "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"];

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState({ day: '', month: '', year: '' });
  const [zodiac, setZodiac] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  const handleSignUp = async () => {
    if (!email || !password || !username || !birthDate.day || !birthDate.month || !birthDate.year || !zodiac) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        birthDate: `${birthDate.day}.${birthDate.month}.${birthDate.year}`,
        zodiac: zodiac,
        email: user.email,
      });
    } catch (error: any) {
      Alert.alert("Kayıt Hatası", error?.message ?? 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Aramıza Katıl</Text>
      <Text style={styles.subtitle}>Yeni bir serüvene başla.</Text>
      
      <TextInput style={styles.input} placeholder="Kullanıcı Adı" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="E-posta" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Şifre" value={password} onChangeText={setPassword} secureTextEntry />
      
      <Text style={styles.label}>Doğum Tarihin</Text>
      <View style={styles.dateContainer}>
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Gün" value={birthDate.day} onChangeText={(text) => setBirthDate({...birthDate, day: text})} keyboardType="number-pad" maxLength={2} />
        <TextInput style={[styles.input, styles.dateInput]} placeholder="Ay" value={birthDate.month} onChangeText={(text) => setBirthDate({...birthDate, month: text})} keyboardType="number-pad" maxLength={2} />
        <TextInput style={[styles.input, styles.dateInput, { flex: 2 }]} placeholder="Yıl" value={birthDate.year} onChangeText={(text) => setBirthDate({...birthDate, year: text})} keyboardType="number-pad" maxLength={4} />
      </View>

      <Text style={styles.label}>Burcun</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.pickerText}>{zodiac || "Burcunu Seç"}</Text>
        <CaretDown size={20} color={colors.textMuted} />
      </TouchableOpacity>

      {loading ? <ActivityIndicator size="large" color={colors.primaryButton} style={{ marginTop: 20 }}/> : (
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Zaten bir hesabın var mı? </Text>
        <Link href="/(auth)" asChild><TouchableOpacity><Text style={styles.linkText}>Giriş Yap</Text></TouchableOpacity></Link>
      </View>

      <Modal transparent={true} visible={modalVisible} animationType="fade">
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
    container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background },
    title: { fontFamily: 'Nunito-ExtraBold', fontSize: 32, color: colors.textDark, textAlign: 'center' },
    subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: 20 },
    label: { fontFamily: 'Nunito-Bold', color: colors.textMuted, alignSelf: 'flex-start', marginLeft: 5, marginBottom: 5, marginTop: 10 },
    input: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, fontFamily: 'Nunito-SemiBold', fontSize: 16, borderWidth: 1, borderColor: '#EAE5D9' },
    dateContainer: { flexDirection: 'row', gap: 10 },
    dateInput: { flex: 1, textAlign: 'center', paddingHorizontal: 10 },
    pickerButton: { width: '100%', backgroundColor: colors.card, paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#EAE5D9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    pickerText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textDark },
    button: { width: '100%', backgroundColor: colors.primaryButton, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonText: { fontFamily: 'Nunito-Bold', color: colors.textLight, fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted },
    linkText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: colors.primaryButton },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: colors.card, borderRadius: 20, padding: 20, width: '80%', maxHeight: '60%' },
    modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EAE5D9' },
    modalItemText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, textAlign: 'center', color: colors.textDark },
});


