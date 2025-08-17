// app/(tabs)/profile.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { 
  Heart, 
  Star, 
  ChatCircle, 
  SignOut,
  User,
  BookmarkSimple
} from 'phosphor-react-native';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import { db } from '../../firebaseConfig';

const { width: screenWidth } = Dimensions.get('window');

// Post type'ını tanımla
interface Post {
  id: string;
  text: string;
  authorName?: string;
  authorId?: string;
  createdAt: any;
  likedBy?: string[];
  likeCount?: number;
  favoritedBy?: string[];
  favoriteCount?: number;
}

// Profil sekmesi türleri
type ProfileTab = 'posts' | 'favorites' | 'likes';

// Zamanı dinamik olarak formatlayan yardımcı fonksiyon
const timeAgo = (timestamp: any) => {
  if (!timestamp?.toDate) return 'az önce';
  return formatDistanceToNow(timestamp.toDate(), { addSuffix: false, locale: tr }) + ' önce';
};

// Post kartı bileşeni - Minimal ve şık tasarım
const PostCard = ({ item, colors, isLast }: { item: Post; colors: any; isLast: boolean }) => {
  const styles = getStyles(colors);
  
  return (
    <View style={styles.postContainer}>
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
        
        <Text style={styles.postText}>{item.text}</Text>
        
        <View style={styles.postFooter}>
          <View style={styles.actionButton}>
            <Heart size={16} color={colors.textMuted} weight="regular" />
            <Text style={styles.actionText}>{item.likeCount || 0}</Text>
          </View>
          
          <View style={styles.actionButton}>
            <Star size={16} color={colors.textMuted} weight="regular" />
            <Text style={styles.actionText}>{item.favoriteCount || 0}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, userData, signOutUser } = useAuth();
  const { showFeedback } = useFeedback();
  const styles = useMemo(() => getStyles(colors), [colors]);
  
  // State'ler
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [favorites, setFavorites] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalFavorites: 0
  });

  // Profil verilerini yükle
  const loadProfileData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Kullanıcının paylaşımlarını yükle (index olmadan)
      const postsQuery = query(
        collection(db, "posts"),
        where("authorId", "==", user.uid)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      // Client-side sorting
      postsData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
      });
      setPosts(postsData);
      
      // Favori eklenen paylaşımları yükle (index olmadan)
      const favoritesQuery = query(
        collection(db, "posts"),
        where("favoritedBy", "array-contains", user.uid)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      // Client-side sorting
      favoritesData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
      });
      setFavorites(favoritesData);
      
      // Beğenilen paylaşımları yükle (index olmadan)
      const likesQuery = query(
        collection(db, "posts"),
        where("likedBy", "array-contains", user.uid)
      );
      const likesSnapshot = await getDocs(likesQuery);
      const likesData = likesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[];
      // Client-side sorting
      likesData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.toDate?.() - a.createdAt.toDate?.() || 0;
      });
      setLikes(likesData);
      
      // İstatistikleri hesapla
      const totalLikes = postsData.reduce((sum, post) => sum + (post.likeCount || 0), 0);
      const totalFavorites = postsData.reduce((sum, post) => sum + (post.favoriteCount || 0), 0);
      
      setStats({
        totalPosts: postsData.length,
        totalLikes,
        totalFavorites
      });
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      showFeedback({ message: 'Profil verileri yüklenirken hata oluştu.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const handleSignOut = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOutUser();
              showFeedback({ message: 'Başarıyla çıkış yapıldı!', type: 'info' });
            } catch (error) {
              console.error('Error signing out:', error);
              showFeedback({ message: 'Çıkış yapılırken hata oluştu.', type: 'error' });
            }
          }
        }
      ]
    );
  };

  // İlk yükleme
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.noUserText}>Profil görüntülemek için giriş yapmalısın</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Aktif sekmeye göre veri seç
  const getActiveData = () => {
    switch (activeTab) {
      case 'posts':
        return posts;
      case 'favorites':
        return favorites;
      case 'likes':
        return likes;
      default:
        return posts;
    }
  };

  // Sekme başlığı
  const getTabTitle = () => {
    switch (activeTab) {
      case 'posts':
        return 'Paylaşımlarım';
      case 'favorites':
        return 'Favorilerim';
      case 'likes':
        return 'Beğenilerim';
      default:
        return 'Paylaşımlarım';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Minimal ve şık */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(userData?.displayName || userData?.anonymousName || user.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            
            <Text style={styles.userName}>
              {userData?.displayName || userData?.anonymousName || user.email?.split('@')[0] || 'Kullanıcı'}
            </Text>
            <Text style={styles.userId}>@{user.uid.slice(0, 8)}</Text>
          </View>

          {/* İstatistikler - Minimal kartlar */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalPosts}</Text>
              <Text style={styles.statLabel}>Paylaşım</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalLikes}</Text>
              <Text style={styles.statLabel}>Beğeni</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalFavorites}</Text>
              <Text style={styles.statLabel}>Favori</Text>
            </View>
          </View>

          {/* Çıkış butonu */}
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <SignOut size={16} color={colors.textMuted} />
            <Text style={styles.signOutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Sekmeler - Minimal tasarım */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]} 
            onPress={() => setActiveTab('posts')}
          >
            <ChatCircle size={18} color={activeTab === 'posts' ? colors.header : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
              Paylaşımlarım
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'favorites' && styles.activeTab]} 
            onPress={() => setActiveTab('favorites')}
          >
            <Star size={18} color={activeTab === 'favorites' ? '#FFD700' : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
              Favorilerim
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'likes' && styles.activeTab]} 
            onPress={() => setActiveTab('likes')}
          >
            <Heart size={18} color={activeTab === 'likes' ? colors.header : colors.textMuted} />
            <Text style={[styles.tabText, activeTab === 'likes' && styles.activeTabText]}>
              Beğenilerim
            </Text>
          </TouchableOpacity>
        </View>

        {/* İçerik */}
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>{getTabTitle()}</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color={colors.header} style={styles.loader} />
          ) : getActiveData().length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'posts' && 'Henüz paylaşım yapmadın'}
                {activeTab === 'favorites' && 'Henüz favori eklemedin'}
                {activeTab === 'likes' && 'Henüz beğeni yapmadın'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'posts' && 'İlk paylaşımını yapmaya başla!'}
                {activeTab === 'favorites' && 'Beğendiğin sözleri favori ekle!'}
                {activeTab === 'likes' && 'Beğendiğin sözleri beğen!'}
              </Text>
            </View>
          ) : (
            <View>
              {getActiveData().map((item, index) => (
                <PostCard 
                  key={item.id}
                  item={item} 
                  colors={colors} 
                  isLast={index === getActiveData().length - 1} 
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: any) => {
  return StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
    },
    header: {
      backgroundColor: colors.header,
      paddingTop: 30,
      paddingBottom: 40,
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    profileInfo: {
      alignItems: 'center',
      marginBottom: 30,
    },
    avatarContainer: {
      marginBottom: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.textLight,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    avatarText: {
      fontFamily: 'Nunito-ExtraBold',
      fontSize: 32,
      color: colors.header,
    },
    userName: {
      fontFamily: 'Nunito-ExtraBold',
      fontSize: 24,
      color: colors.textLight,
      marginBottom: 8,
    },
    userId: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textLight + 'CC',
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      width: '100%',
      marginBottom: 30,
      paddingHorizontal: 40,
    },
    statCard: {
      alignItems: 'center',
      backgroundColor: colors.textLight + '20',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderRadius: 15,
      minWidth: 70,
    },
    statNumber: {
      fontFamily: 'Nunito-ExtraBold',
      fontSize: 22,
      color: colors.textLight,
      marginBottom: 5,
    },
    statLabel: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 11,
      color: colors.textLight + 'CC',
      textAlign: 'center',
    },
    signOutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.textLight + '20',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
    },
    signOutText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 14,
      color: colors.textLight,
      marginLeft: 8,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      marginHorizontal: 20,
      marginTop: -20,
      borderRadius: 20,
      padding: 5,
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 15,
    },
    activeTab: {
      backgroundColor: colors.header + '20',
    },
    tabText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 12,
      color: colors.textMuted,
      marginLeft: 6,
    },
    activeTabText: {
      color: colors.textDark,
      fontFamily: 'Nunito-Bold',
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 25,
    },
    sectionTitle: {
      fontFamily: 'Nunito-Bold',
      fontSize: 20,
      color: colors.textDark,
      marginBottom: 20,
      textAlign: 'center',
    },
    loader: {
      marginTop: 50,
    },
    emptyContainer: {
      alignItems: 'center',
      paddingTop: 50,
    },
    emptyText: {
      fontFamily: 'Nunito-Bold',
      fontSize: 18,
      color: colors.textDark,
      marginBottom: 10,
      textAlign: 'center',
    },
    emptySubtext: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    postContainer: {
      marginBottom: 16,
    },
    postContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.mode === 'dark' ? colors.header + '15' : '#F0F0F0',
      shadowColor: colors.shadow ?? '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    authorAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.header,
      justifyContent: 'center',
      alignItems: 'center',
    },
    authorInitial: {
      fontFamily: 'Nunito-Bold',
      fontSize: 12,
      color: colors.textLight,
    },
    authorInfo: {
      marginLeft: 10,
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
      color: colors.textMuted,
    },
    postText: {
      fontFamily: 'Nunito-Regular',
      fontSize: 14,
      color: colors.textDark,
      lineHeight: 20,
      marginBottom: 12,
    },
    postFooter: {
      flexDirection: 'row',
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.mode === 'dark' ? colors.header + '15' : '#F0F0F0',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    actionText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 12,
      marginLeft: 6,
      color: colors.textMuted,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    noUserText: {
      fontFamily: 'Nunito-SemiBold',
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
};
