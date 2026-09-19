// Secondary entry point: '@momo/home-data-access/testing'.
// Kept out of the main entry so test helpers never reach the app bundle.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import type { HomeRepository } from './repository/home-repository';
import { HomeRepositoryProvider } from './repository/home-repository-context';

/** An empty home page. A test overrides `getLayout` with the few sections it
    is about. */
export function createFakeHomeRepository(
  overrides: Partial<HomeRepository> = {},
): HomeRepository {
  return {
    getLayout: async () => [],
    ...overrides,
  };
}

/** A fresh query cache per mount and no retries, so a failure fails at once. */
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
