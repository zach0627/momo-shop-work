// Secondary entry point: '@momo/catalog-data-access/testing'.
// Kept out of the main entry so test helpers never reach the app bundle.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import type { CatalogRepository } from './repository/catalog-repository';
import { CatalogRepositoryProvider } from './repository/catalog-repository-context';

/**
 * A repository that answers "nothing" everywhere. A test overrides only the
 * methods it cares about, with data small enough to read in the test itself.
 */
export function createFakeCatalogRepository(
  overrides: Partial<CatalogRepository> = {},
): CatalogRepository {
  return {
    getProduct: async () => null,
    getCollection: async () => [],
    getRecommendations: async () => ({ items: [], nextOffset: null }),
    getFlashSale: async () => ({
      endsAt: new Date(0).toISOString(),
      items: [],
    }),
    getRanking: async () => [],
    getCategories: async () => [],
    ...overrides,
  };
}

/** A fresh query cache per mount and no retries, so a failure fails at once. */
export function CatalogTestProvider({
  repository = createFakeCatalogRepository(),
  children,
}: {
  repository?: CatalogRepository;
  children: ReactNode;
}) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <CatalogRepositoryProvider repository={repository}>
        {children}
      </CatalogRepositoryProvider>
    </QueryClientProvider>
  );
}
