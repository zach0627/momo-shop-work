import { createContext, useContext, type ReactNode } from 'react';

import type { CatalogRepository } from './catalog-repository';

const CatalogRepositoryContext = createContext<CatalogRepository | null>(null);

/**
 * Which implementation the hooks talk to is decided once, at the composition
 * root (the app's providers). Tests mount this with a fake.
 */
export function CatalogRepositoryProvider({
  repository,
  children,
}: {
  repository: CatalogRepository;
  children: ReactNode;
}) {
  return (
    <CatalogRepositoryContext.Provider value={repository}>
      {children}
    </CatalogRepositoryContext.Provider>
  );
}

export function useCatalogRepository(): CatalogRepository {
  const repository = useContext(CatalogRepositoryContext);
  if (!repository) {
    throw new Error(
      'No catalog repository: wrap the tree in <CatalogRepositoryProvider>.',
    );
  }
  return repository;
}
