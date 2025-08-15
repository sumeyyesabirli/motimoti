// app/add-post.tsx
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CaretLeft, UserCircle } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';

const anonymousAdjectives = ["Mor", "Yeşil", "Mavi", "Hızlı", "Sakin", "Gizemli", "Mutlu", "Umutlu", "Nazik"];

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
          const randomAdjective = anonymousAdjectives[Math.floor(Math.random() * anonymousAdjectives.length)];
          const newAnonymousName = `Anonim ${randomAdjective}`;
          
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
        <TouchableOpacity style={styles.anonymousButton} onPress={() => setIsAnonymous(!isAnonymous)}>
            <UserCircle size={24} color={isAnonymous ? colors.primaryButton : colors.textMuted} weight={isAnonymous ? 'fill' : 'regular'} />
            <Text style={[styles.anonymousText, { color: isAnonymous ? colors.primaryButton : colors.textMuted }]}>
                {isAnonymous ? 'Anonim' : 'Herkese Açık'}
            </Text>
        </TouchableOpacity>
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
        autoFocus={true}
      />
      
      {loading && <ActivityIndicator size="large" color={colors.primaryButton} />}
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingTop: 50, 
      paddingHorizontal: 24, 
      paddingBottom: 20 
    },
    headerButton: { 
      backgroundColor: colors.card, 
      width: 44, 
      height: 44, 
      borderRadius: 22, 
      justifyContent: 'center', 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: '#EAE5D9' 
    },
    shareButton: { 
      backgroundColor: colors.primaryButton, 
      paddingVertical: 10, 
      paddingHorizontal: 20, 
      borderRadius: 20 
    },
    shareButtonText: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 16, 
      color: colors.textLight 
    },
    input: { 
      flex: 1, 
      padding: 24, 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 18, 
      color: colors.textDark, 
      textAlignVertical: 'top' 
    },
    anonymousButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1, 
      borderColor: '#EAE5D9'
    },
    anonymousText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 14,
      marginLeft: 8,
    },
});