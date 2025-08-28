// components/PaginatedFlatList.tsx
import React from 'react';
import {
  FlatList,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface PaginationData {
  currentPage: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
}

interface PaginatedFlatListProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  loading: boolean;
  pagination: PaginationData | null;
  onLoadMore: () => void;
  onRefresh: () => void;
  canLoadMore: boolean;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: any;
  style?: any;
  showsVerticalScrollIndicator?: boolean;
  onEndReachedThreshold?: number;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
}

export function PaginatedFlatList<T = any>({
  data,
  renderItem,
  keyExtractor,
  loading,
  pagination,
  onLoadMore,
  onRefresh,
  canLoadMore,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle,
  style,
  showsVerticalScrollIndicator = false,
  onEndReachedThreshold = 0.1,
  onScroll,
  scrollEventThrottle = 16,
}: PaginatedFlatListProps<T>) {
  const { colors } = useTheme();

  const renderFooter = () => {
    if (!canLoadMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primaryButton} />
        <Text style={[styles.footerText, { color: colors.textMuted }]}>
          Daha fazla yükleniyor...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return ListEmptyComponent;
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={style}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onEndReached={onLoadMore}
      onEndReachedThreshold={onEndReachedThreshold}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={loading && pagination?.currentPage === 1}
          onRefresh={onRefresh}
          colors={[colors.primaryButton]}
          tintColor={colors.primaryButton}
        />
      }
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={10}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  footerText: {
    fontFamily: 'Nunito-Regular',
    fontSize: 14,
    marginLeft: 8,
  },
});
