import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as postsService from '../../services/posts';
import { useTheme } from '../../context/ThemeContext';
import Post from '../../components/Post/Post';
import { UserCircle } from 'phosphor-react-native';

export default function UserProfileScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { id, viewMode } = useLocalSearchParams<{ id: string; viewMode: 'anonymous' | 'public' }>();

    const [posts, setPosts] = useState<any[]>([]);
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchPosts = async () => {
                setLoading(true);
                console.log('🔍 Fetching posts for user:', id, 'viewMode:', viewMode);
                const shouldFetchAnonymous = viewMode === 'anonymous';
                const response = await postsService.getUserPosts(id, shouldFetchAnonymous);

                if (response.success && response.data.length > 0) {
                    setPosts(response.data);
                    // Yazar adını ilk posttan güvenli bir şekilde al
                    setAuthorName(response.data[0].authorName);
                } else {
                    setPosts([]); // Post yoksa listeyi boşalt
                    // Post olmasa bile başlığı doğru set et
                    setAuthorName(viewMode === 'anonymous' ? 'Anonim' : 'Kullanıcı');
                }
                setLoading(false);
            };
            fetchPosts();
        }
    }, [id, viewMode]);

    // Başlığı, veri geldikten sonra dinamik olarak güncelle
    useLayoutEffect(() => {
        const title = viewMode === 'anonymous' 
            ? 'Anonim Paylaşımlar' 
            : (authorName ? `${authorName}'in Paylaşımları` : 'Kullanıcı Paylaşımları');
        
        navigation.setOptions({
            title: title,
        });
    }, [navigation, authorName, viewMode]);

    // Stil dosyasını burada oluşturalım
    const styles = getStyles(colors);

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primaryButton} />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* YENİ VE RENKLİ PROFİL BAŞLIĞI */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <UserCircle size={64} color={colors.primaryButton} weight="light" />
                </View>
                <Text style={styles.headerAuthorName}>{authorName}</Text>
                <Text style={styles.headerPostCount}>{posts.length} Paylaşım</Text>
            </View>

            {/* POST LİSTESİ */}
            {posts.length > 0 ? (
                posts.map(post => <Post key={post.id} post={post} />)
            ) : (
                <Text style={styles.emptyText}>Bu kullanıcının henüz bir paylaşımı yok.</Text>
            )}
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileHeader: {
        backgroundColor: colors.card,
        paddingVertical: 24,
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerAuthorName: {
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 22,
        color: colors.textDark,
        marginTop: 12,
    },
    // YENİ STİL: Avatar için renkli arka plan
    avatarContainer: {
        backgroundColor: colors.primaryButton + '20', // Ana rengin şeffaf hali
        borderRadius: 50,
        padding: 8,
    },
    headerAuthorName: {
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 22,
        color: colors.textDark,
        marginTop: 12,
    },
    headerPostCount: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 14,
        color: colors.primaryButton, // Rengi daha belirgin hale getirdik
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: colors.textMuted,
        fontFamily: 'Nunito-SemiBold',
    },
});
