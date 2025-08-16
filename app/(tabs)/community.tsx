// app/(tabs)/community.tsx
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Link, useFocusEffect } from 'expo-router';
import { arrayRemove, arrayUnion, collection, doc, increment, onSnapshot, orderBy, query, updateDoc, deleteDoc } from 'firebase/firestore';
import { Heart, Plus, Star, PencilSimple, Trash } from 'phosphor-react-native';
import React, { useMemo, useState, useEffect } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Alert, Modal, TextInput } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { db } from '../../firebaseConfig';

// Zamanı dinamik olarak formatlayan yardımcı fonksiyon
const timeAgo = (timestamp: any) => {
  if (!timestamp?.toDate) return 'az önce';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: true, locale: tr });
};

// Renk alfa değerini ayarlayan yardımcı fonksiyon
const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};

// Paylaşım kartı için alt timeline tasarımı
const PostCard = ({ item, colors, onLike, userId, isLast, onDelete, onEdit }: { item: any; colors: any; onLike: any; userId: any; isLast: boolean; onDelete: (id: string) => void; onEdit: (id: string, newText: string) => void }) => {
  const styles = getStyles(colors);
  const isLiked = item.likedBy?.includes(userId);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  
  // Yanıp sönen animasyon için
  const pulseValue = useSharedValue(1);
  
  useEffect(() => {
    pulseValue.value = withRepeat(
      withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1, // Sonsuz tekrar
      true // Reverse
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseValue.value,
      transform: [{ scale: 0.8 + (pulseValue.value * 0.2) }],
    };
  });

  const handleEdit = () => {
    if (editText.trim().length < 10) {
      return;
    }
    onEdit(item.id, editText.trim());
    setIsEditing(false);
  };

  return (
    <View style={styles.postContainer}>
      {/* Post içeriği */}
      <View style={styles.postContent}>
        <View style={styles.postHeader}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {(item.authorName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.postAuthor}>{item.authorName || 'Anonim'}</Text>
            <Text style={styles.postTimestamp}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>
        
        {/* Düzenleme Inline Edit */}
        {isEditing ? (
          <View style={styles.inlineEditContainer}>
            <TextInput
              style={styles.inlineEditInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Paylaşımınızı düzenleyin..."
              multiline={true}
              textAlignVertical="top"
              maxLength={500}
            />
            <View style={styles.inlineEditButtons}>
              <TouchableOpacity 
                style={styles.inlineEditButtonCancel}
                onPress={() => {
                  setIsEditing(false);
                  setEditText(item.text);
                }}
              >
                <Text style={styles.inlineEditButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.inlineEditButtonSave, editText.trim().length < 10 && styles.inlineEditButtonDisabled]}
                onPress={handleEdit}
                disabled={editText.trim().length < 10}
              >
                <Text style={styles.inlineEditButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.postText}>{item.text}</Text>
        )}
        
        <View style={styles.postFooter}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]} 
            onPress={() => onLike(item.id, isLiked)}
          >
            <Heart size={16} color={isLiked ? colors.header : colors.textMuted} weight={isLiked ? 'fill' : 'regular'} />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {item.likeCount || 0}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Star size={16} color={colors.textMuted} />
            <Text style={styles.actionText}>Favori</Text>
          </TouchableOpacity>

          {/* Sadece post sahibi görebilir */}
          {item.authorId === userId && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
              >
                <PencilSimple size={16} color={colors.textMuted} />
                <Text style={styles.actionText}>Düzenle</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onDelete(item.id)}
              >
                <Trash size={16} color={colors.textMuted} />
                <Text style={styles.actionText}>Sil</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      
      {/* Alt timeline çizgisi */}
      {!isLast && (
        <View style={styles.bottomTimelineContainer}>
          <View style={styles.bottomTimelineLine} />
          <Animated.View style={[styles.bottomTimelineDot, pulseStyle]} />
        </View>
      )}

      {/* Düzenleme Bottom Sheet */}
      {/* Removed as per edit hint */}
    </View>
  );
};

export default function CommunityScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showFeedback } = useFeedback();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeader, setShowHeader] = useState(true);
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  // Header animasyonu için
  const headerHeight = useSharedValue(120);
  const headerOpacity = useSharedValue(1);
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: headerOpacity.value,
      transform: [{ translateY: headerHeight.value === 0 ? -20 : 0 }],
    };
  });

  useFocusEffect(
    React.useCallback(() => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Firebase'den gerçek zamanlı paylaşımları al
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Firestore posts loaded:', postsData.length); // Debug için
        setPosts(postsData);
        setLoading(false);
      }, (error) => {
        console.error('Firestore error:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }, [user])
  );

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return; // Giriş yapmamış kullanıcılar beğenemez
    
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likeCount: increment(isLiked ? -1 : 1),
      });
      console.log('Post like updated successfully'); // Debug için
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Paylaşımı Sil',
      'Bu paylaşımı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "posts", postId));
              showFeedback({ message: 'Paylaşım başarıyla silindi!', type: 'info' });
            } catch (error) {
              console.error('Error deleting post:', error);
              showFeedback({ message: 'Paylaşım silinirken hata oluştu.', type: 'error' });
            }
          }
        }
      ]
    );
  };

  const handleEdit = async (postId: string, newText: string) => {
    try {
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        text: newText,
        updatedAt: new Date(),
      });
      showFeedback({ message: 'Paylaşım başarıyla güncellendi!', type: 'info' });
    } catch (error) {
      console.error('Error updating post:', error);
      showFeedback({ message: 'Paylaşım güncellenirken hata oluştu.', type: 'error' });
    }
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 5) {
      // Header'ı gizle ama bildirimler görünsün
      headerHeight.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerOpacity.value = withSpring(0, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    } else {
      // Header'ı göster
      headerHeight.value = withSpring(120, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
      headerOpacity.value = withSpring(1, { 
        damping: 20, 
        stiffness: 80,
        mass: 0.8
      });
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Topluluk Alanı</Text>
          <Text style={styles.headerSubtitle}>Giriş yaparak topluluğa katıl</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.noUserText}>Topluluğa katılmak için giriş yapmalısın</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Text style={styles.headerTitle}>Topluluk Alanı</Text>
        <Text style={styles.headerSubtitle}>Birbirinize ilham verin</Text>
      </Animated.View>
      
      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryButton} style={{ flex: 1 }} />
      ) : posts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.noPostsText}>Henüz paylaşım yok</Text>
          <Text style={styles.noPostsSubtext}>İlk paylaşımı sen yap!</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <PostCard item={item} colors={colors} onLike={handleLike} userId={user.uid} isLast={index === posts.length - 1} onDelete={handleDelete} onEdit={handleEdit} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
        />
      )}

      <Link href="/add-post" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus size={32} color={colors.textLight} weight="bold" />
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => {
  // Koyu/açık temaya göre daha balanslı alfa
  const isDark =
    (colors?.mode === 'dark') ||
    (colors?.background && typeof colors.background === 'string' && colors.background[0] === '#'
      && parseInt(colors.background.slice(1,3), 16) < 0x80); // kaba kontrol

  const cardBg      = withAlpha(colors.card, isDark ? 0.14 : 0.85);
  const cardBgHover = withAlpha(colors.card, isDark ? 0.18 : 0.90);
  const cardBorder  = withAlpha(colors.textDark ?? '#000', isDark ? 0.10 : 0.06);
  const shadow      = isDark ? 0.22 : 0.12;

  return StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: colors.background,
      zIndex: 1,
    },
    header: { 
      paddingTop: 45, 
      paddingBottom: 20, 
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.mode === 'dark' ? colors.header + '20' : '#E0E0E0',
      shadowColor: colors.mode === 'dark' ? colors.header : '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: colors.mode === 'dark' ? 0.4 : 0.3,
      shadowRadius: 16,
      elevation: 12,
      height: 120,
    },
    headerTitle: { 
      fontFamily: 'Nunito-ExtraBold', 
      fontSize: 30, 
      color: colors.textDark,
      textAlign: 'center',
      letterSpacing: 0.3,
      marginBottom: 6,
      lineHeight: 36,
    },
    headerSubtitle: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 16, 
      color: colors.textMuted, 
      textAlign: 'center',
      letterSpacing: 0.2,
      opacity: 0.85,
      lineHeight: 20,
    },
    listContainer: { 
      paddingHorizontal: 0, 
      paddingBottom: 120,
      paddingTop: 140,
    },
    postContainer: {
      marginBottom: 8, // 16'dan 8'e düşürdüm
      paddingHorizontal: 16,
    },
    // Base + "hover/pressed" efektini Pressable ile vereceğiz
    postContent: {
      backgroundColor: cardBg,
      borderRadius: 16,
      padding: 20,
      // hafif çerçeve ile beyazlığı kır
      borderWidth: 1,
      borderColor: cardBorder,
      // daha yumuşak gölge
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: shadow,
      shadowRadius: 10,
      elevation: 3,
      // Koyu tema için ek efektler
      ...(colors.mode === 'dark' && {
        borderColor: colors.header + '20',
        shadowColor: colors.header,
        shadowOpacity: 0.3,
      }),
    },
    // Hover / pressed efektinde kullanacağımız alternatif (web)
    postContentHover: {
      backgroundColor: cardBgHover,
      borderColor: withAlpha(colors.header, isDark ? 0.30 : 0.18),
      elevation: 5,
    },
    postHeader: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 12 
    },
    authorAvatar: { 
      width: 28, 
      height: 28, 
      borderRadius: 14, 
      backgroundColor: colors.header, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    authorInitial: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 12, 
      color: colors.textLight 
    },
    authorInfo: { 
      marginLeft: 10 
    },
    postAuthor: { 
      fontFamily: 'Nunito-Bold', 
      fontSize: 14, 
      color: colors.textDark,
      marginBottom: 2,
    },
    postTimestamp: { 
      fontFamily: 'Nunito-Regular', 
      fontSize: 10, 
      color: colors.textMuted 
    },
    postText: { 
      fontFamily: 'Nunito-Regular', 
      fontSize: 14, 
      color: colors.textDark, 
      lineHeight: 20, 
      marginBottom: 12 
    },
    postFooter: { 
      flexDirection: 'row', 
      borderTopWidth: 0, 
      borderTopColor: 'transparent', 
      paddingTop: 10 
    },
    actionButton: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginRight: 16,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    actionText: { 
      fontFamily: 'Nunito-SemiBold', 
      fontSize: 11, 
      marginLeft: 4,
      color: colors.textMuted,
    },
    likedButton: { 
      backgroundColor: colors.mode === 'dark' ? colors.header + '25' : colors.header + '15',
      borderWidth: 0,
    },
    likedText: { 
      color: colors.header,
      fontFamily: 'Nunito-Bold',
    },
    fab: { 
      position: 'absolute', 
      bottom: 140, 
      right: 30, 
      width: 60, 
      height: 60, 
      borderRadius: 30, 
      backgroundColor: colors.header, 
      justifyContent: 'center', 
      alignItems: 'center', 
      shadowColor: colors.mode === 'dark' ? colors.header : colors.header, 
      shadowOffset: { width: 0, height: 5 }, 
      shadowOpacity: colors.mode === 'dark' ? 0.5 : 0.3, 
      shadowRadius: 10, 
      elevation: 10 
    },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
    noUserText: { fontFamily: 'Nunito-SemiBold', fontSize: 16, color: colors.textMuted, textAlign: 'center' },
    noPostsText: { fontFamily: 'Nunito-Bold', fontSize: 18, color: colors.textDark, textAlign: 'center', marginBottom: 8 },
    noPostsSubtext: { fontFamily: 'Nunito-Regular', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
    bottomTimelineContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
      marginBottom: 8,
    },
    bottomTimelineLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.mode === 'dark' ? colors.header + '40' : colors.header + '30',
      marginRight: 8,
    },
    bottomTimelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.header + '80',
      borderWidth: 2,
      borderColor: colors.header,
      shadowColor: colors.header,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.6,
      shadowRadius: 4,
      elevation: 4,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 24,
      width: '90%',
      maxWidth: 400,
      alignItems: 'center',
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
      zIndex: 10000,
    },
    modalTitle: {
      fontFamily: 'Nunito-Bold',
      fontSize: 20,
      color: colors.textDark,
      marginBottom: 16,
    },
    editInput: {
      width: '100%',
      minHeight: 120,
      borderColor: colors.textMuted + '30',
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textDark,
      backgroundColor: colors.card + '80',
      textAlignVertical: 'top',
      marginBottom: 20,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
    },
    modalButtonCancel: {
      backgroundColor: colors.textMuted + '20',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderWidth: 1,
      borderColor: colors.textMuted,
    },
    modalButtonSave: {
      backgroundColor: colors.header,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    modalButtonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textLight,
    },
    modalButtonDisabled: {
      opacity: 0.6,
    },
    inlineEditContainer: {
      backgroundColor: colors.mode === 'dark' ? colors.card + '60' : colors.card + '80',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.mode === 'dark' ? colors.header + '30' : colors.textMuted + '30',
      marginBottom: 12,
    },
    inlineEditInput: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textDark,
      minHeight: 100,
      textAlignVertical: 'top',
      paddingBottom: 10,
      backgroundColor: 'transparent',
    },
    inlineEditButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
    },
    inlineEditButtonCancel: {
      backgroundColor: colors.mode === 'dark' ? colors.textMuted + '20' : colors.textMuted + '40',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderWidth: 2,
      borderColor: colors.mode === 'dark' ? colors.textMuted + '40' : colors.textMuted + '80',
    },
    inlineEditButtonSave: {
      backgroundColor: colors.header,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    inlineEditButtonText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textLight,
    },
    inlineEditButtonDisabled: {
      opacity: 0.6,
    },
  });
};