// 第二個入口 '@momo/catalog-data-access/testing'：測試工具不會進到 app 的 bundle
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import type { CatalogRepository } from './repository/catalog-repository';
import { CatalogRepositoryProvider } from './repository/catalog-repository-context';

/** 每個方法都回「沒有東西」的 repository；測試只覆寫自己在意的方法。 */
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

/** 每次掛載都是新的 query cache，而且不重試。 */
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
