import { QueryCache, QueryClient } from '@tanstack/react-query';

import { reportError } from '@momo/shared-util';

/** 所有失敗的查詢在這裡統一回報一次（帶 query key），頁面與 hook 不用自己報。 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) =>
        reportError(error, { queryKey: query.queryKey }),
    }),
    defaultOptions: {
      queries: {
        // mock 資料不會變，也不會暫時性失敗
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}
