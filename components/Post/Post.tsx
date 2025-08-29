import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useFeedback } from '../../context/FeedbackContext';
import * as postsService from '../../services/posts';
import { Heart, Star, UserCircle } from 'phosphor-react-native';
import { usePosts } from '../../context/PostsContext';
import { getPlatformShadow } from '../../hooks/useResponsive';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
dayjs.locale('tr');

const Post = ({ post }: { post: any }) => {
    const { colors } = useTheme();
    const { user } = useAuth();
    const router = useRouter();
    const { showFeedback } = useFeedback();
    const { updatePostLikes, updatePostFavorites } = usePosts();
    const [isExpanded, setIsExpanded] = useState(false); // "Devamını Oku" için state

    const styles = React.useMemo(() => getStyles(colors), [colors]);

    if (!post) return null;
    


    const isLiked = user ? post.likedBy?.some((liker: any) => liker.id === user.id) : false;
    const isFavorited = user ? post.favoritedBy?.some((favoriter: any) => favoriter.id === user.id) : false;
    
    // Metnin uzun olup olmadığını kontrol et (200 karakterden uzunsa)
    const isLongText = post.text.length > 200;

    const handleProfilePress = () => {
        if (post.authorId) {
            if (user && user.id === post.authorId) {
                router.push('/(tabs)/profile');
                return;
            }
            router.push({
                pathname: `/user/${post.authorId}`,
                params: { viewMode: post.isAnonymous ? 'anonymous' : 'public' },
            });
        }
    };

    const handleLike = async () => {
        if (!user) {
            showFeedback({ message: 'Beğenmek için giriş yapmalısın.', type: 'info' });
            return;
        }
        const response = await postsService.toggleLike(post.id);
        if (response.success) {
            updatePostLikes(post.id, response.data.likedBy);
        }
    };

    const handleFavorite = async () => {
        if (!user) {
            showFeedback({ message: 'Favorilere eklemek için giriş yapmalısın.', type: 'info' });
            return;
        }
        const response = await postsService.toggleFavorite(post.id);
        if (response.success) {
            updatePostFavorites(post.id, response.data.favoritedBy);
        }
    };

    return (
        <View style={styles.card}>
            {/* KART BAŞLIĞI - Yazar Bilgileri */}
            <TouchableOpacity onPress={handleProfilePress} style={styles.postHeader}>
                <UserCircle size={32} color={colors.textMuted} weight="light" />
                <View style={styles.authorInfo}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    <Text style={styles.postDate}>{dayjs(post.createdAt).format('DD MMMM YYYY')}</Text>
                </View>
                {post.isAnonymous && (
                    <View style={styles.anonymousTag}>
                        <Text style={styles.anonymousTagText}>Anonim</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* KART İÇERİĞİ - "Devamını Oku" eklenmiş hali */}
            <View>
                <Text 
                    style={styles.postContent}
                    // Eğer metin uzunsa ve genişletilmemişse, 5 satır göster
                    numberOfLines={isLongText && !isExpanded ? 5 : undefined}
                >
                    {post.text}
                </Text>
                {isLongText && !isExpanded && (
                    <TouchableOpacity onPress={() => setIsExpanded(true)} style={{alignSelf: 'flex-start'}}>
                        <Text style={styles.readMoreText}>Devamını Oku</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* KART ALT BİLGİSİ - Aksiyon Butonları */}
            <View style={styles.postFooter}>
                <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
                    <Heart size={20} color={isLiked ? colors.danger : colors.textMuted} weight={isLiked ? 'fill' : 'regular'} />
                    <Text style={[styles.actionText, { color: isLiked ? colors.danger : colors.textMuted }]}>
                        {post.likedBy?.length || 0}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleFavorite} style={styles.actionButton}>
                    <Star size={20} color={isFavorited ? colors.warning : colors.textMuted} weight={isFavorited ? 'fill' : 'regular'} />
                    <Text style={[styles.actionText, { color: isFavorited ? colors.warning : colors.textMuted }]}>
                        {post.favoritedBy?.length || 0}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const getStyles = (colors: any) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 10,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
        ...getPlatformShadow(2, colors.shadow),
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorInfo: {
        marginLeft: 10,
        flex: 1,
    },
    authorName: {
        fontFamily: 'Nunito-Bold',
        fontSize: 15,
        color: colors.textDark,
    },
    postDate: {
        fontFamily: 'Nunito-Regular',
        fontSize: 12,
        color: colors.textMuted,
    },
    anonymousTag: {
        backgroundColor: colors.primaryButton + '20', // Ana rengin şeffaf hali
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    anonymousTagText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 11,
        color: colors.primaryButton,
    },
    postContent: {
        fontFamily: 'Nunito-Regular',
        fontSize: 16,
        color: colors.textDark,
        lineHeight: 24,
        marginBottom: 8, 
    },
    readMoreText: {
        fontFamily: 'Nunito-Bold',
        fontSize: 14,
        color: colors.primaryButton,
        lineHeight: 24,
        marginBottom: 16, // Alt boşluk
    },
    postFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionText: {
        fontFamily: 'Nunito-SemiBold',
        fontSize: 14,
        marginLeft: 6,
    },
});

export default Post;
