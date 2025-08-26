// components/PaginatedFlatList.tsx
import React from 'react';
import { FlatList, ActivityIndicator } from 'react-native';

interface PaginatedFlatListProps<T> {
  data: T[];
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  loading?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  onScroll?: (event: any) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  numColumns?: number;
  horizontal?: boolean;
  pagingEnabled?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  decelerationRate?: 'normal' | 'fast' | number;
  scrollEventThrottle?: number;
}

export function PaginatedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  loading,
  onRefresh,
  refreshing,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onScroll,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  numColumns,
  horizontal = false,
  pagingEnabled = false,
  showsHorizontalScrollIndicator = false,
  decelerationRate = 'normal',
  scrollEventThrottle = 16
}: PaginatedFlatListProps<T>) {
  
  // Loading spinner component'i
  const LoadingSpinner = () => (
    <ActivityIndicator 
      size="small" 
      color="#81B29A" 
      style={{ marginVertical: 20 }} 
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      onScroll={onScroll}
      onRefresh={onRefresh}
      refreshing={refreshing || false}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={loading ? <LoadingSpinner /> : ListFooterComponent}
      numColumns={numColumns}
      horizontal={horizontal}
      pagingEnabled={pagingEnabled}
      showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
      decelerationRate={decelerationRate}
      scrollEventThrottle={scrollEventThrottle}
    />
  );
}
