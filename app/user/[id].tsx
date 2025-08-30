import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import * as postsService from '../../services/posts';
import { useTheme } from '../../context/ThemeContext';
import Post from '../../components/Post/Post';
import { UserCircle } from 'phosphor-react-native';
import { getPlatformShadow } from '../../hooks/useResponsive';

export default function UserProfileScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const { id, viewMode } = useLocalSearchParams<{ id: string; viewMode: 'anonymous' | 'public' }>();

    const [posts, setPosts] = useState<any[]>([]);
    const [authorName, setAuthorName] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Yanıp sönen ışık için Animated değeri
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (id) {
            const fetchPosts = async () => {
                setLoading(true);
                const shouldFetchAnonymous = viewMode === 'anonymous';
                const response = await postsService.getUserPosts(id, shouldFetchAnonymous);

                if (response.success && response.data.length > 0) {
                    setPosts(response.data);
                    setAuthorName(response.data[0].authorName);
                } else {
                    setPosts([]);
                    setAuthorName(viewMode === 'anonymous' ? 'Anonim' : 'Kullanıcı');
                }
                setLoading(false);
            };
            fetchPosts();
        }
    }, [id, viewMode]);

    // Yanıp sönen ışık animasyonu - Daha belirgin
    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.4,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        );
        
        pulseAnimation.start();
        
        return () => pulseAnimation.stop();
    }, [pulseAnim]);

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
    
    const styles = getStyles(colors);

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 50 }} size="large" color={colors.primaryButton} />;
    }

    return (
        <ScrollView style={styles.container}>
            {/* Minimal Tasarım */}
            
            {/* Sade Profil Başlığı */}
            <View style={styles.minimalHeader}>
                <UserCircle size={48} color={colors.primaryButton} weight="light" />
                <Text style={styles.minimalName}>{authorName}</Text>
                <Text style={styles.minimalCount}>{posts.length} Paylaşım</Text>
            </View>
            
            {/* Post Listesi */}
            <View style={styles.postsSection}>
                {posts.length > 0 ? (
                    <>
                        <View style={styles.postsList}>
                            {posts.map((post, index) => (
                                <View key={post.id}>
                                    <Post post={post} />
                                    {index < posts.length - 1 && (
                                        <View style={styles.postDivider}>
                                            <View style={styles.dividerLine} />
                                            <View style={styles.orangeDot}>
                                                                                                 <Animated.View 
                                                     style={[
                                                         styles.pulseLight,
                                                         {
                                                             transform: [{ scale: pulseAnim }],
                                                             opacity: pulseAnim.interpolate({
                                                                 inputRange: [1, 1.4],
                                                                 outputRange: [0.6, 1],
                                                             }),
                                                         }
                                                     ]} 
                                                 />
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Bu kullanıcının henüz bir paylaşımı yok.</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const getStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    minimalHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '30',
    },
    minimalName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 20,
        color: colors.textDark,
        marginTop: 12,
        marginBottom: 4,
    },
    minimalCount: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 14,
        color: colors.textMuted,
    },
    postsSection: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    sectionTitle: {
        fontFamily: 'Nunito-Bold',
        fontSize: 18,
        color: colors.textDark,
        marginBottom: 16,
        textAlign: 'center',
    },
    postsList: {
        gap: 0,
    },
    postWrapper: {
        marginBottom: 8,
    },
    postDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: colors.primaryButton + '40',
    },
    orangeDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.primaryButton,
        marginLeft: 12,
        shadowColor: colors.primaryButton,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseLight: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.background,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        textAlign: 'center',
        color: colors.textMuted,
        fontFamily: 'Nunito-SemiBold',
        fontSize: 16,
    },
});
