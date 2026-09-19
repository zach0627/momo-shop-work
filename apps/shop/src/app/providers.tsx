import { useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import {
  CatalogRepositoryProvider,
  createMockCatalogRepository,
} from '@momo/catalog-data-access';
import {
  createMockHomeRepository,
  HomeRepositoryProvider,
} from '@momo/home-data-access';
import { LinkProvider } from '@momo/shared-ui';

import { createQueryClient } from './query-client';
import { RouterLink } from './router-link';

// Long enough for loading states to be seen, short enough not to get in the way.
const MOCK_LATENCY_MS = 150;

/**
 * Composition root. Everything a package needs but must not choose for itself
 * is decided here: how links navigate, and which repository implementations
 * the data hooks talk to. Moving from mock data to a real API means replacing
 * the two `createMock...Repository` calls below - nothing else changes.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [catalogRepository] = useState(() =>
    createMockCatalogRepository({ latencyMs: MOCK_LATENCY_MS }),
  );
  const [homeRepository] = useState(() =>
    createMockHomeRepository({ latencyMs: MOCK_LATENCY_MS }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CatalogRepositoryProvider repository={catalogRepository}>
        <HomeRepositoryProvider repository={homeRepository}>
          <LinkProvider component={RouterLink}>{children}</LinkProvider>
        </HomeRepositoryProvider>
      </CatalogRepositoryProvider>
    </QueryClientProvider>
  );
}
