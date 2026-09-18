import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  CatalogRepositoryProvider,
  createMockCatalogRepository,
} from '@momo/catalog-data-access';
import { LinkProvider } from '@momo/shared-ui';

import { RouterLink } from './router-link';

// Long enough for loading states to be seen, short enough not to get in the way.
const MOCK_LATENCY_MS = 150;

/**
 * Composition root. Everything a package needs but must not choose for itself
 * is decided here: how links navigate, and which repository implementation
 * the data hooks talk to. Moving from mock data to a real API means replacing
 * `createMockCatalogRepository` below - nothing else changes.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Mock data never changes underneath us and never fails transiently.
            staleTime: Infinity,
            retry: false,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  const [catalogRepository] = useState(() =>
    createMockCatalogRepository({ latencyMs: MOCK_LATENCY_MS }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CatalogRepositoryProvider repository={catalogRepository}>
        <LinkProvider component={RouterLink}>{children}</LinkProvider>
      </CatalogRepositoryProvider>
    </QueryClientProvider>
  );
}
