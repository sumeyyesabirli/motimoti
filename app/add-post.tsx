// app/add-post.tsx
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CaretLeft } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';

// 3 haneli rastgele kod üreten fonksiyon
const generateAnonymousId = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  const getRandomChar = (charset: string) => charset.charAt(Math.floor(Math.random() * charset.length));

  const patterns = [
    () => getRandomChar(letters) + getRandomChar(numbers) + getRandomChar(letters),
    () => getRandomChar(numbers) + getRandomChar(letters) + getRandomChar(numbers),
    () => getRandomChar(numbers) + getRandomChar(numbers) + getRandomChar(letters),
  ];

  const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
  return `Anonim-${selectedPattern()}`;
};

export default function AddPostScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [userData, setUserData] = useState({ username: 'Anonim', anonymousName: '' });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            username: data.username || 'Anonim',
            anonymousName: data.anonymousName || ''
          });
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleShare = async () => {
    if (postText.trim().length < 10) {
      Alert.alert("Hata", "Yazınız en az 10 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    try {
      let authorNameToSave = userData.username;

      if (isAnonymous) {
        if (userData.anonymousName) {
          authorNameToSave = userData.anonymousName;
        } else {
          const newAnonymousName = generateAnonymousId();
          
          const userDocRef = doc(db, "users", user!.uid);
          await updateDoc(userDocRef, { anonymousName: newAnonymousName });
          
          authorNameToSave = newAnonymousName;
        }
      }

      await addDoc(collection(db, "posts"), {
        text: postText,
        authorId: user!.uid,
        authorName: authorNameToSave,
        createdAt: serverTimestamp(),
        likeCount: 0,
        likedBy: [],
      });
      router.back();
    } catch (_) {
      Alert.alert("Hata", "Yazınız paylaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <CaretLeft size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İlham Ver</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Buraya ilham verici bir şeyler yaz..."
        multiline
        value={postText}
        onChangeText={setPostText}
      />
      
      <View style={styles.anonymousContainer}>
        <Text style={styles.anonymousText}>Anonim olarak paylaş</Text>
        <Switch
          trackColor={{ false: "#767577", true: colors.primaryButton }}
          thumbColor={isAnonymous ? colors.card : "#f4f3f4"}
          onValueChange={() => setIsAnonymous(previousState => !previousState)}
          value={isAnonymous}
        />
      </View>

      {loading && <ActivityIndicator size="large" color={colors.primaryButton} />}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingHorizontal: 24, paddingBottom: 20 },
    headerButton: { backgroundColor: colors.card, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAE5D9' },
    headerTitle: { fontFamily: 'Nunito-Bold', fontSize: 22, color: colors.textDark },
    shareButton: { backgroundColor: colors.primaryButton, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
    shareButtonText: { fontFamily: 'Nunito-Bold', fontSize: 16, color: colors.textLight },
    input: { flex: 1, padding: 24, fontFamily: 'Nunito-SemiBold', fontSize: 18, color: colors.textDark, textAlignVertical: 'top' },
    anonymousContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 24,
      borderTopWidth: 1,
      borderTopColor: '#EAE5D9',
    },
    anonymousText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textDark,
    },
});