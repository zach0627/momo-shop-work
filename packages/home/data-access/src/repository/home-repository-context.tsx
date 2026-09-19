import { createContext, useContext, type ReactNode } from 'react';

import type { HomeRepository } from './home-repository';

const HomeRepositoryContext = createContext<HomeRepository | null>(null);

/** 由 app 的 providers 注入 repository；測試則注入 fake。 */
export function HomeRepositoryProvider({
  repository,
  children,
}: {
  repository: HomeRepository;
  children: ReactNode;
}) {
  return (
    <HomeRepositoryContext.Provider value={repository}>
      {children}
    </HomeRepositoryContext.Provider>
  );
}

export function useHomeRepository(): HomeRepository {
  const repository = useContext(HomeRepositoryContext);
  if (!repository) {
    throw new Error(
      'No home repository: wrap the tree in <HomeRepositoryProvider>.',
    );
  }
  return repository;
}
