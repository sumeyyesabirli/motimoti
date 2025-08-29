// app/user/[id].tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as postsService from '../../services/posts';
import { useTheme } from '../../context/ThemeContext';

// Basit post kartı component'i
const SimplePostCard = ({ item, colors }: { item: any; colors: any }) => {
  const isAnonymous = item.isAnonymous;
  
  return (
    <View style={[
      styles.postCard,
      { 
        backgroundColor: colors.card, 
        borderColor: colors.textMuted + '22',
        borderWidth: 1,
      },
      isAnonymous && { 
        borderColor: colors.primaryButton + '40', 
        borderWidth: 2 
      }
    ]}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={[
            styles.authorAvatar,
            { backgroundColor: colors.header },
            isAnonymous && { backgroundColor: colors.primaryButton + '20' }
          ]}>
            <Text style={[
              styles.authorAvatarText,
              { color: colors.textLight }
            ]}>
              {isAnonymous ? '🎭' : (item.authorName || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={[
              styles.authorName,
              { color: colors.textDark },
              isAnonymous && { color: colors.primaryButton }
            ]}>
              {isAnonymous ? 'Anonim' : item.authorName || 'Kullanıcı'}
            </Text>
            <Text style={[styles.postDate, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
        {isAnonymous && (
          <View style={[styles.anonBadge, { backgroundColor: colors.primaryButton + '20' }]}>
            <Text style={[styles.anonBadgeText, { color: colors.primaryButton }]}>Anonim</Text>
          </View>
        )}
      </View>
      
      <Text style={[styles.postText, { color: colors.textDark }]}>{item.text}</Text>
      
      <View style={styles.postStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statText, { color: colors.textMuted }]}>❤️ {item.likeCount || 0}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statText, { color: colors.textMuted }]}>⭐ {item.favoriteCount || 0}</Text>
        </View>
      </View>
    </View>
  );
};

export default function UserProfileScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  
  const { id, viewMode } = useLocalSearchParams<{ 
    id: string; 
    viewMode: 'anonymous' | 'public'; 
  }>();
  
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostsAndSetTitle = async () => {
      if (!id || !viewMode) return;

      setLoading(true);
      navigation.setOptions({ title: 'Yükleniyor...' }); // 1. Geçici başlık ayarla

      const shouldFetchAnonymous = viewMode === 'anonymous';
      const response = await postsService.getUserPosts(id, shouldFetchAnonymous);

      if (response.success) {
        setPosts(response.data);
        
        // 2. Veri geldikten sonra başlığı GÜNCEL ve DOĞRU veriyle ayarla
        if (response.data.length > 0) {
          // Güvenilir kaynak: API'den gelen ilk postun yazar adı
          const authorName = response.data[0].authorName;
          navigation.setOptions({ title: `${authorName}'in Paylaşımları` });
        } else {
          // Post yoksa, moda uygun bir varsayılan başlık ayarla
          const fallbackTitle = viewMode === 'anonymous' ? 'Anonim Paylaşımlar' : 'Kullanıcı Paylaşımları';
          navigation.setOptions({ title: fallbackTitle });
        }
      } else {
        console.error("Failed to fetch user posts:", response.message);
        navigation.setOptions({ title: 'Hata Oluştu' });
      }
      setLoading(false);
    };

    fetchPostsAndSetTitle();
  }, [id, viewMode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color={colors.primaryButton} />
      ) : (
                 <FlatList
           data={posts}
           keyExtractor={(item) => item.id.toString()}
           renderItem={({ item }) => <SimplePostCard item={item} colors={colors} />}
           contentContainerStyle={styles.listContainer}
           ListEmptyComponent={
             <View style={styles.emptyContainer}>
                 <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                     Bu kullanıcının gösterecek bir paylaşımı yok.
                 </Text>
             </View>
           }
         />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: { marginTop: 50 },
    listContainer: { paddingVertical: 8, paddingHorizontal: 16 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: '50%' },
    emptyText: { fontSize: 16, fontFamily: 'Nunito-SemiBold' },
    
    // Post kartı stilleri
    postCard: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    authorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    authorAvatarText: {
        fontSize: 18,
        fontFamily: 'Nunito-Bold',
    },
    authorName: {
        fontSize: 16,
        fontFamily: 'Nunito-SemiBold',
        marginBottom: 2,
    },
    postDate: {
        fontSize: 12,
        fontFamily: 'Nunito-Regular',
    },
    anonBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 8,
    },
    anonBadgeText: {
        fontSize: 10,
        fontFamily: 'Nunito-SemiBold',
    },
    postText: {
        fontSize: 16,
        fontFamily: 'Nunito-Regular',
        lineHeight: 24,
        marginBottom: 12,
    },
    postStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontFamily: 'Nunito-Regular',
    },
});
