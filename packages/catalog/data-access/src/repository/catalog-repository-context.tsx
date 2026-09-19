import { createContext, useContext, type ReactNode } from 'react';

import type { CatalogRepository } from './catalog-repository';

const CatalogRepositoryContext = createContext<CatalogRepository | null>(null);

/** 由 app 的 providers 注入 repository；測試則注入 fake。 */
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
