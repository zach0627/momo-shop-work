// 第二個入口 '@momo/home-data-access/testing'：測試工具不會進到 app 的 bundle
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import type { HomeRepository } from './repository/home-repository';
import { HomeRepositoryProvider } from './repository/home-repository-context';

/** 空的首頁；測試覆寫 getLayout 傳入自己的區塊。 */
export function createFakeHomeRepository(
  overrides: Partial<HomeRepository> = {},
): HomeRepository {
  return {
    getLayout: async () => [],
    ...overrides,
  };
}

/** 每次掛載都是新的 query cache，而且不重試。 */
export function HomeTestProvider({
  repository = createFakeHomeRepository(),
  children,
}: {
  repository?: HomeRepository;
  children: ReactNode;
}) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return (
    <QueryClientProvider client={client}>
      <HomeRepositoryProvider repository={repository}>
        {children}
      </HomeRepositoryProvider>
    </QueryClientProvider>
  );
}
