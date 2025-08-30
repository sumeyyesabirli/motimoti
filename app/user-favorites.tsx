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
      // Sadece bu satır değişiyor
      const response = await postsService.getFavoritePosts(); 
      if (response.success) {
        setPosts(response.data);
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
          // ve bu satır değişiyor
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
