import { QueryCache, QueryClient } from '@tanstack/react-query';

import { reportError } from '@momo/shared-util';

/**
 * The app's query client. Every failed query is reported here, once, with
 * the key that failed - so no page or hook has to remember to do it, and
 * none can report the same failure twice.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) =>
        reportError(error, { queryKey: query.queryKey }),
    }),
    defaultOptions: {
      queries: {
        // Mock data never changes underneath us and never fails transiently.
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}
