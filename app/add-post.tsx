// app/add-post.tsx
import { useRouter } from 'expo-router';
import { postService } from '../services/postService';
import { userService } from '../services/userService';
import { CaretLeft, User, UserCircle } from 'phosphor-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { useTheme } from '../context/ThemeContext';


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
  const { user, token } = useAuth();
  const { showFeedback } = useFeedback();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [userData, setUserData] = useState({ username: 'Anonim', anonymousName: '' });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(() => getStyles(colors), [colors]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && token) {
        try {
          const response = await userService.getUserProfile(user.id);
          if (response.success) {
            const data = response.data;
            setUserData({
              username: data.username || 'Anonim',
              anonymousName: data.anonymousName || ''
            });
          }
        } catch (error) {
          console.error('Kullanıcı bilgileri alınamadı:', error);
        }
      }
    };
    fetchUserData();
  }, [user, token]);

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
          
          // Kullanıcı bilgilerini güncelle
          await userService.updateUserProfile(user!.id, { anonymousName: newAnonymousName });
          
          authorNameToSave = newAnonymousName;
        }
      }

      // Post oluştur
      await postService.createPost({
        text: postText,
        authorId: user!.id,
        authorName: authorNameToSave,
        likeCount: 0,
        likedBy: [],
        favoriteCount: 0,
        favoritedBy: [],
      }, token);
      
      showFeedback({ message: 'Paylaşımınız başarıyla eklendi!', type: 'success' });
      router.back();
    } catch (_) {
      showFeedback({ message: 'Yazınız paylaşılamadı.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Test için birden fazla gönderi oluştur
  const createTestPosts = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true); // Use loading for test posts as well
      const testTexts = [
        'Bu bir test gönderisidir. API pagination testi için oluşturuldu.',
        'İkinci test gönderisi. Daha fazla veri için gerekli.',
        'Üçüncü test gönderisi. Sayfa sayfa yükleme testi.',
        'Dördüncü test gönderisi. Scroll sonunda yeni veri yükleme.',
        'Beşinci test gönderisi. API pagination testi.',
        'Altıncı test gönderisi. usePagination hook testi.',
        'Yedinci test gönderisi. PaginatedFlatList component testi.',
        'Sekizinci test gönderisi. 10 gönderi sonrası yeni sayfa.',
        'Dokuzuncu test gönderisi. Aşağı çekme ile veri yükleme.',
        'Onuncu test gönderisi. Otomatik pagination sistemi.',
        'On birinci test gönderisi. API query optimization.',
        'On ikinci test gönderisi. React Native performance.',
        'On üçüncü test gönderisi. FlatList optimization.',
        'On dördüncü test gönderisi. Memory management.',
        'On beşinci test gönderisi. State management.',
        'On altıncı test gönderisi. Hook optimization.',
        'On yedinci test gönderisi. Component reusability.',
        'On sekizinci test gönderisi. TypeScript support.',
        'On dokuzuncu test gönderisi. Error handling.',
        'Yirminci test gönderisi. Loading states.',
        'Yirmi birinci test gönderisi. Refresh functionality.',
        'Yirmi ikinci test gönderisi. End reached handling.',
        'Yirmi üçüncü test gönderisi. HasMore flag.',
        'Yirmi dördüncü test gönderisi. LastDoc tracking.',
        'Yirmi beşinci test gönderisi. Page size management.',
        'Yirmi altıncı test gönderisi. Query constraints.',
        'Yirmi yedinci test gönderisi. Order by field.',
        'Yirmi sekizinci test gönderisi. Direction control.',
        'Yirmi dokuzuncu test gönderisi. Collection name.',
        'Otuzuncu test gönderisi. API integration.',
        'Otuz birinci test gönderisi. Real-time updates.',
        'Otuz ikinci test gönderisi. Offline support.',
        'Otuz üçüncü test gönderisi. Data persistence.',
        'Otuz dördüncü test gönderisi. Cache management.',
        'Otuz beşinci test gönderisi. Network optimization.',
        'Otuz altıncı test gönderisi. Bundle size.',
        'Otuz yedinci test gönderisi. Tree shaking.',
        'Otuz sekizinci test gönderisi. Code splitting.',
        'Otuz dokuzuncu test gönderisi. Lazy loading.',
        'Kırkıncı test gönderisi. Performance monitoring.',
        'Kırk birinci test gönderisi. Sayfa 5 için gerekli.',
        'Kırk ikinci test gönderisi. 10\'ar 10\'ar yükleme.',
        'Kırk üçüncü test gönderisi. Numaralı sayfalama.',
        'Kırk dördüncü test gönderisi. 1,2,3,4,5 sayfalar.',
        'Kırk beşinci test gönderisi. Her sayfa 10 gönderi.',
        'Kırk altıncı test gönderisi. Toplam 50 gönderi.',
        'Kırk yedinci test gönderisi. Test verisi.',
        'Kırk sekizinci test gönderisi. Pagination test.',
        'Kırk dokuzuncu test gönderisi. Son test gönderisi.',
        'Ellinci test gönderisi. Tamamlandı!'
      ];

      for (let i = 0; i < testTexts.length; i++) {
        const postData = {
          text: testTexts[i],
          authorId: user.id,
          authorName: user.email?.split('@')[0] || 'Test User',
          likeCount: Math.floor(Math.random() * 10),
          likedBy: [],
          favoriteCount: Math.floor(Math.random() * 5),
          favoritedBy: [],
          isAnonymous: false
        };

        await postService.createPost(postData, token);
        console.log(`Test post ${i + 1} created`);
      }

      showFeedback({ 
        message: `${testTexts.length} test gönderisi oluşturuldu!`, 
        type: 'info' 
      });
      
    } catch (error) {
      console.error('Error creating test posts:', error);
      showFeedback({ 
        message: 'Test gönderileri oluşturulurken hata oluştu', 
        type: 'error' 
      });
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

      {/* Test butonu - yukarı taşındı, sadece development'ta göster */}
      {__DEV__ && (
        <TouchableOpacity 
          style={[styles.testButton, loading && styles.testButtonDisabled]} 
          onPress={createTestPosts}
          disabled={loading}
        >
          <Text style={styles.testButtonText}>
            {loading ? 'Oluşturuluyor...' : '50 Test Gönderisi Oluştur'}
          </Text>
        </TouchableOpacity>
      )}

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

      <TouchableOpacity 
        style={[styles.submitButton, (loading || postText.trim().length < 10) && styles.submitButtonDisabled]} 
        onPress={handleShare}
        disabled={loading || postText.trim().length < 10}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Paylaşılıyor...' : 'Paylaş'}
        </Text>
      </TouchableOpacity>
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
    submitButton: {
      backgroundColor: colors.primaryButton,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      alignItems: 'center',
      marginHorizontal: 24,
      marginBottom: 20,
    },
    submitButtonText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 16,
      color: colors.textLight,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    testButton: {
      backgroundColor: '#FF6B6B',
      padding: 15,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
      marginHorizontal: 24,
    },
    testButtonDisabled: {
      opacity: 0.6,
    },
    testButtonText: {
      fontFamily: 'Nunito-Bold',
      color: '#FFFFFF',
      fontSize: 16,
    },
  });