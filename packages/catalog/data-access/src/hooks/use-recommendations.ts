import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { catalogKeys } from '../query-keys';
import { useCatalogRepository } from '../repository/catalog-repository-context';

/**
 * "You may also like": pages are appended as the user asks for more.
 *
 * Returns the flattened list and a `loadMore` that is safe to call at any
 * time, so the component does not need to know how paging works.
 */
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
    // `cancelRefetch: false` is what makes a repeated call harmless: by
    // default fetchNextPage cancels the request in flight and starts over.
    // `isFetchingNextPage` alone cannot guard this - a double click arrives
    // before React has re-rendered, so this closure still sees `false`.
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
