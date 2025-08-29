import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as postsService from '../../services/posts';
import { useTheme } from '../../context/ThemeContext';
import Post from '../../components/Post/Post';
import { UserCircle } from 'phosphor-react-native';
import { getPlatformShadow } from '../../hooks/useResponsive'; // getPlatformShadow'u import et


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
            headerTitleStyle: {
                fontFamily: 'Nunito-Bold',
            },
        });
    }, [navigation, authorName, viewMode]);

    // Stil dosyasını burada oluşturalım
    const styles = getStyles(colors);

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primaryButton} />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* YENİ VE UYGULAMAYA UYGUN PROFİL KARTI BAŞLIĞI */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    <UserCircle size={48} color={colors.primaryButton} weight="light" />
                </View>
                <Text style={styles.headerAuthorName}>{authorName}</Text>
                <Text style={styles.headerPostCount}>{posts.length} Paylaşım</Text>
            </View>

            {/* POST LİSTESİ */}
            {posts.length > 0 ? (
                posts.map(post => <Post key={post.id} post={post} />)
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Bu kullanıcının henüz bir paylaşımı yok.</Text>
                </View>
            )}
        </ScrollView>
    );
}

// YENİ VE TASARIMA UYGUN STİLLER
const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    profileHeader: {
        backgroundColor: colors.card,
        borderRadius: 16, // Daha uygun kenarlar
        marginHorizontal: 16,
        marginTop: 12,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: 12,
        ...getPlatformShadow(2, colors.shadow), // Gölgelendirme
    },
    avatarContainer: {
        backgroundColor: colors.primaryButton + '20', // Tema renginin açık tonu
        borderRadius: 50,
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerAuthorName: {
        fontFamily: 'Nunito-ExtraBold',
        fontSize: 26,
        color: colors.textDark,
    },
    headerPostCount: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textMuted,
        fontFamily: 'Nunito-SemiBold',
        fontSize: 16,
    },
});
