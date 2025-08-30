import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import * as postsService from '../services/posts';
import { useTheme } from '../context/ThemeContext';
import Post from '../components/Post/Post';

export default function UserFavoritesScreen() {
  const { colors } = useTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoritePosts = async () => {
      setLoading(true);
      console.log('🚀 Favorilerim API çağrılıyor...');
      const response = await postsService.getFavoritePosts(); 
      console.log('📡 Favorilerim API Response:', response);
      if (response.success) {
        console.log('✅ Favorilerim başarılı, post sayısı:', response.data?.length || 0);
        setPosts(response.data);
      } else {
        console.log('❌ Favorilerim hatası:', response.message);
      }
      setLoading(false);
    };
    fetchFavoritePosts();
  }, []);

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Favori Paylaşımlarım' }} />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primaryButton} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <Post post={item} />}
          contentContainerStyle={{ paddingTop: 10 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Henüz bir paylaşımı favorilerine eklememişsin.</Text>}
        />
      )}
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: colors.textMuted,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 16,
  },
});
