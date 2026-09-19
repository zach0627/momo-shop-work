import { createContext, useContext, type ReactNode } from 'react';

import type { HomeRepository } from './home-repository';

const HomeRepositoryContext = createContext<HomeRepository | null>(null);

/**
 * Which implementation `useHomeLayout` talks to is decided once, at the
 * composition root (the app's providers). Tests mount this with a fake.
 */
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
