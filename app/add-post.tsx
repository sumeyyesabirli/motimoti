// app/add-post.tsx
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CaretLeft, User, UserCircle } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
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
  const { showFeedback } = useFeedback();
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
      showFeedback({ message: 'Yazınız en az 10 karakter olmalıdır.', type: 'error' });
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
      
      showFeedback({ message: 'Paylaşımınız başarıyla eklendi!', type: 'success' });
      router.back();
    } catch (_) {
      showFeedback({ message: 'Yazınız paylaşılamadı.', type: 'error' });
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

      <View style={styles.anonymousToggleContainer}>
        <View style={styles.anonymousInfo}>
          <UserCircle size={24} color={colors.primaryButton} />
          <Text style={styles.anonymousTitle}>Anonim Paylaşım</Text>
        </View>
        <Switch
          trackColor={{ false: "#767577", true: colors.primaryButton }}
          thumbColor={isAnonymous ? colors.card : "#f4f3f4"}
          onValueChange={() => setIsAnonymous(previousState => !previousState)}
          value={isAnonymous}
        />
      </View>

      {isAnonymous && (
        <View style={styles.anonymousBanner}>
          <Text style={styles.anonymousBannerText}>
            🎭 Bu paylaşım anonim olarak görünecek. Kimliğin gizli kalacak.
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Buraya ilham verici bir şeyler yaz..."
        placeholderTextColor={colors.textMuted}
        multiline
        value={postText}
        onChangeText={setPostText}
      />
      
      <View style={styles.characterCount}>
        <Text style={styles.characterCountText}>
          {postText.length}/500 karakter
        </Text>
        {postText.length < 10 && (
          <Text style={styles.characterWarning}>
            En az 10 karakter gerekli
          </Text>
        )}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryButton} />
          <Text style={styles.loadingText}>Paylaşılıyor...</Text>
        </View>
      )}
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
    anonymousToggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: colors.card,
      marginHorizontal: 24,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#EAE5D9',
    },
    anonymousInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    anonymousTitle: {
      fontFamily: 'Nunito-Bold',
      fontSize: 16,
      color: colors.textDark,
      marginLeft: 12,
    },
    anonymousBanner: {
      backgroundColor: colors.primaryButton + '20',
      marginHorizontal: 24,
      marginBottom: 20,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: colors.primaryButton,
    },
    anonymousBannerText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: colors.primaryButton,
      textAlign: 'center',
    },
    input: { 
      flex: 1, 
      padding: 24, 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 18, 
      color: colors.textDark, 
      textAlignVertical: 'top',
      lineHeight: 26,
    },
    characterCount: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      alignItems: 'center',
    },
    characterCountText: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textMuted,
    },
    characterWarning: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 12,
      color: '#FF6B6B',
      marginTop: 4,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.background + 'CC',
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textDark,
      marginTop: 16,
    },
  });