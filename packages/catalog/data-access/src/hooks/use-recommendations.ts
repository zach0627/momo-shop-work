import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

/** 「你可能會喜歡」的分頁：回傳攤平的清單、hasMore，以及隨時可呼叫的 loadMore。 */
export function useRecommendations(pageSize: number) {
  const repository = useCatalogRepository();

  const query = useInfiniteQuery({
    queryKey: catalogKeys.recommendations(pageSize),
    queryFn: ({ pageParam }) =>
      repository.getRecommendations({ offset: pageParam, limit: pageSize }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
  });

  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const loadMore = useCallback(() => {
    // cancelRefetch: false 讓重複呼叫無害：預設會取消進行中的請求重來。
    // 不能靠 isFetchingNextPage 擋：連點發生在重新 render 之前，closure 裡還是 false。
    if (hasNextPage) void fetchNextPage({ cancelRefetch: false });
  }, [hasNextPage, fetchNextPage]);

  return {
    items,
    hasMore: hasNextPage,
    isPending: query.isPending,
    isLoadingMore: isFetchingNextPage,
    isError: query.isError,
    loadMore,
  };
}
